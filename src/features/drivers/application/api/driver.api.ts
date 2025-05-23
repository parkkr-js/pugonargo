import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
// src/features/drivers/application/api/driver.api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { message } from "antd";
import type {
	CreateDriverRequest,
	CreateDriverResponse,
	Driver,
	UpdateDriverRequest,
} from "../../domain/entities/Driver";
import type { DriverRepository } from "../../domain/interfaces/DriverRepository";
import { DriverService } from "../../domain/services/DriverService";

// 🔥 API 에러 타입 정의
interface ApiError {
	status: "FETCH_ERROR" | "VALIDATION_ERROR" | "CUSTOM_ERROR";
	error: string;
}

// 🔥 RTK Query 에러 타입
interface RTKQueryError {
	error?: ApiError;
}

// 서비스 인스턴스 생성 (인터페이스를 통한 의존성 주입)
const driverRepository: DriverRepository = new DriverService();

// 비즈니스 로직 검증 함수들 (재사용 가능)
const validateCreateDriverData = (data: CreateDriverRequest): void => {
	if (!data.vehicleNumber.trim()) {
		throw new Error("차량번호는 필수입니다.");
	}
	if (!/^\d{4}$/.test(data.vehicleNumber)) {
		throw new Error("차량번호는 4자리 숫자여야 합니다.");
	}
	if (data.groupNumber <= 0) {
		throw new Error("그룹번호는 양수여야 합니다.");
	}
	if (data.dumpWeight <= 0) {
		throw new Error("덤프중량은 양수여야 합니다.");
	}
};

const validateUpdateDriverData = (data: UpdateDriverRequest): void => {
	if (!data.id) {
		throw new Error("수정할 기사의 ID가 필요합니다.");
	}
	if (!data.groupNumber && data.dumpWeight === undefined) {
		throw new Error("수정할 정보가 없습니다.");
	}
	if (data.groupNumber && data.groupNumber <= 0) {
		throw new Error("그룹번호는 양수여야 합니다.");
	}
	if (data.dumpWeight !== undefined && data.dumpWeight <= 0) {
		throw new Error("덤프중량은 양수여야 합니다.");
	}
};

// 🔥 에러 처리 헬퍼
const handleApiError = (
	error: unknown,
	fallbackMessage: string,
): FetchBaseQueryError => {
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;
	return { status: "CUSTOM_ERROR", error: errorMessage };
};

export const driverApi = createApi({
	reducerPath: "driverApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/", // Firebase는 직접 호출하므로 더미 URL
	}),
	tagTypes: ["Driver"],
	endpoints: (builder) => ({
		// 📋 기사 목록 조회
		getDrivers: builder.query<Driver[], void>({
			queryFn: async () => {
				try {
					const drivers = await driverRepository.getAllDrivers();
					return { data: drivers };
				} catch (error) {
					return {
						error: handleApiError(
							error,
							"기사 목록을 불러오는데 실패했습니다.",
						),
					};
				}
			},
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: "Driver" as const, id })),
							{ type: "Driver" as const, id: "LIST" },
						]
					: [{ type: "Driver" as const, id: "LIST" }],
		}),

		// ➕ 기사 생성
		createDriver: builder.mutation<CreateDriverResponse, CreateDriverRequest>({
			queryFn: async (driverData) => {
				try {
					validateCreateDriverData(driverData);
					const result = await driverRepository.createDriver(driverData);
					return { data: result };
				} catch (error) {
					return { error: handleApiError(error, "기사 추가에 실패했습니다.") };
				}
			},
			invalidatesTags: [{ type: "Driver", id: "LIST" }],
			onQueryStarted: async (_, { queryFulfilled }) => {
				try {
					const { data } = await queryFulfilled;
					message.success({
						content: `기사님이 성공적으로 추가되었습니다!\n차량번호: ${data.driver.vehicleNumber}`,
						duration: 4,
					});
				} catch (error) {
					const rtkError = error as RTKQueryError;
					message.error({
						content: rtkError.error?.error || "기사 추가에 실패했습니다.",
						duration: 3,
					});
				}
			},
		}),

		// ✏️ 기사 수정
		updateDriver: builder.mutation<Driver, UpdateDriverRequest>({
			queryFn: async (updateData) => {
				try {
					validateUpdateDriverData(updateData);
					const result = await driverRepository.updateDriver(updateData);
					return { data: result };
				} catch (error) {
					return {
						error: handleApiError(error, "기사 정보 수정에 실패했습니다."),
					};
				}
			},
			// 🔥 옵티미스틱 업데이트 (타입 안전성 강화)
			onQueryStarted: async (updateData, { dispatch, queryFulfilled }) => {
				const patchResult = dispatch(
					driverApi.util.updateQueryData("getDrivers", undefined, (draft) => {
						const driverIndex = draft.findIndex(
							(driver) => driver.id === updateData.id,
						);
						if (driverIndex !== -1) {
							const targetDriver = draft[driverIndex];
							if (updateData.groupNumber !== undefined) {
								targetDriver.groupNumber = updateData.groupNumber;
							}
							if (updateData.dumpWeight !== undefined) {
								targetDriver.dumpWeight = updateData.dumpWeight;
							}
							targetDriver.updatedAt = new Date().toISOString();
						}
					}),
				);

				try {
					await queryFulfilled;
					message.success({
						content: `✅ 기사 정보가 성공적으로 수정되었습니다!\n덤프중량: ${updateData.dumpWeight}톤 | 그룹: #${updateData.groupNumber}`,
						duration: 3,
					});
				} catch (error) {
					patchResult.undo(); // 실패시 롤백
					const rtkError = error as RTKQueryError;
					message.error({
						content: rtkError.error?.error || "기사 정보 수정에 실패했습니다.",
						duration: 3,
					});
				}
			},
			invalidatesTags: (result, error, { id }) => [{ type: "Driver", id }],
		}),

		// 🗑️ 기사 삭제
		deleteDriver: builder.mutation<void, string>({
			queryFn: async (driverId) => {
				try {
					if (!driverId) {
						throw new Error("삭제할 기사의 ID가 필요합니다.");
					}
					await driverRepository.deleteDriver(driverId);
					return { data: undefined };
				} catch (error) {
					return { error: handleApiError(error, "기사 삭제에 실패했습니다.") };
				}
			},
			// 🔥 옵티미스틱 업데이트
			onQueryStarted: async (driverId, { dispatch, queryFulfilled }) => {
				const patchResult = dispatch(
					driverApi.util.updateQueryData("getDrivers", undefined, (draft) => {
						return draft.filter((driver) => driver.id !== driverId);
					}),
				);

				try {
					await queryFulfilled;
					message.success({
						content:
							"기사님이 성공적으로 삭제되었습니다!\n삭제된 데이터는 복구할 수 없습니다.",
						duration: 3,
					});
				} catch (error) {
					patchResult.undo(); // 실패시 롤백
					const rtkError = error as RTKQueryError;
					message.error({
						content: rtkError.error?.error || "기사 삭제에 실패했습니다.",
						duration: 3,
					});
				}
			},
			invalidatesTags: (result, error, driverId) => [
				{ type: "Driver", id: driverId },
			],
		}),
	}),
});

export const {
	useGetDriversQuery,
	useCreateDriverMutation,
	useUpdateDriverMutation,
	useDeleteDriverMutation,
} = driverApi;

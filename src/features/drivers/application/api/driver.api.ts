// src/features/drivers/application/api/driver.api.ts
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	CreateDriverRequest,
	CreateDriverResponse,
	Driver,
	UpdateDriverRequest,
} from "../../domain/entities/Driver";
import type { DriverRepository } from "../../domain/interfaces/DriverRepository";
import { DriverService } from "../../domain/services/DriverService";
import { DriverUseCases } from "../usecases/DriverUseCases";

const driverService: DriverRepository = new DriverService();
const driverUseCases = new DriverUseCases(driverService);

const handleApiError = (
	error: unknown,
	fallbackMessage: string,
): FetchBaseQueryError => {
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;
	return {
		status: "CUSTOM_ERROR",
		error: errorMessage,
		data: { error: errorMessage },
	};
};

export const driverApi = createApi({
	reducerPath: "driverApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/",
	}),
	tagTypes: ["Driver"],
	endpoints: (builder) => ({
		// 📋 기사 목록 조회
		getDrivers: builder.query<Driver[], void>({
			queryFn: async () => {
				try {
					const drivers = await driverUseCases.getAllDrivers();
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

		// ➕ 기사 생성 - UseCase에서 모든 검증 처리
		createDriver: builder.mutation<CreateDriverResponse, CreateDriverRequest>({
			queryFn: async (driverData) => {
				try {
					const result = await driverUseCases.createDriver(driverData);
					return { data: result };
				} catch (error) {
					return {
						error: handleApiError(error, "기사 추가에 실패했습니다."),
					};
				}
			},
			invalidatesTags: [{ type: "Driver", id: "LIST" }],
		}),

		// ✏️ 기사 수정 - UseCase에서 모든 검증 처리
		updateDriver: builder.mutation<Driver, UpdateDriverRequest>({
			queryFn: async (updateData) => {
				try {
					const result = await driverUseCases.updateDriver(updateData);
					return { data: result };
				} catch (error) {
					return {
						error: handleApiError(error, "기사 정보 수정에 실패했습니다."),
					};
				}
			},
			// 🔥 옵티미스틱 업데이트
			onQueryStarted: async (updateData, { dispatch, queryFulfilled }) => {
				const patchResult = dispatch(
					driverApi.util.updateQueryData("getDrivers", undefined, (draft) => {
						const driverIndex = draft.findIndex(
							(driver) => driver.id === updateData.id,
						);
						if (driverIndex !== -1) {
							const targetDriver = draft[driverIndex];
							if (updateData.vehicleNumber !== undefined) {
								targetDriver.vehicleNumber = updateData.vehicleNumber;
							}
							if (updateData.group !== undefined) {
								targetDriver.group = updateData.group;
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
				} catch (error) {
					patchResult.undo(); // 실패시 롤백
				}
			},
			invalidatesTags: (result, error, { id }) => [{ type: "Driver", id }],
		}),

		// 🗑️ 기사 삭제
		deleteDriver: builder.mutation<void, string>({
			queryFn: async (driverId) => {
				try {
					await driverUseCases.deleteDriver(driverId);
					return { data: undefined };
				} catch (error) {
					return {
						error: handleApiError(error, "기사 삭제에 실패했습니다."),
					};
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
				} catch (error) {
					patchResult.undo(); // 실패시 롤백
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

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
// src/features/drivers/presentation/hooks/useDrivers.ts
import { useCallback, useMemo, useState } from "react";
import {
	useCreateDriverMutation,
	useDeleteDriverMutation,
	useGetDriversQuery,
	useUpdateDriverMutation,
} from "../../application/api/driver.api";
import {
	selectDriverById,
	selectDriversByGroup,
	selectDriversSortedByGroup,
	selectDriversSortedByVehicleNumber,
} from "../../application/selectors/driverSelectors";
import type {
	CreateDriverRequest,
	UpdateDriverRequest,
} from "../../domain/entities/Driver";

export const useDrivers = () => {
	// 🔥 RTK Query 훅들 사용
	const {
		data: drivers = [],
		isLoading,
		error,
		refetch: loadDrivers,
	} = useGetDriversQuery();

	const [createDriverMutation] = useCreateDriverMutation();
	const [updateDriverMutation] = useUpdateDriverMutation();
	const [deleteDriverMutation] = useDeleteDriverMutation();

	// 🔥 생성된 비밀번호 상태
	const [lastCreatedPassword, setLastCreatedPassword] = useState<string | null>(
		null,
	);

	// 🔥 셀렉터 결과 메모이제이션
	const driversByGroup = useMemo(
		() => (group: string) => selectDriversByGroup(drivers, group),
		[drivers],
	);

	const driverById = useMemo(
		() => (id: string) => selectDriverById(drivers, id),
		[drivers],
	);

	const sortedDriversByGroup = useMemo(
		() => selectDriversSortedByGroup(drivers),
		[drivers],
	);

	const sortedDriversByVehicleNumber = useMemo(
		() => selectDriversSortedByVehicleNumber(drivers),
		[drivers],
	);

	// 🎯 기사 생성 - RTK Query 사용 (UseCase 로직은 API 레이어에서 처리)
	const handleCreateDriver = useCallback(
		async (data: CreateDriverRequest) => {
			try {
				const result = await createDriverMutation(data).unwrap();
				setLastCreatedPassword(result.password);
				return { success: true, data: result };
			} catch (error: unknown) {
				if ("data" in (error as FetchBaseQueryError)) {
					const err = error as FetchBaseQueryError;
					throw new Error(
						(err.data as { error?: string })?.error ||
							"기사 생성에 실패했습니다.",
					);
				}
				throw new Error("기사 생성에 실패했습니다.");
			}
		},
		[createDriverMutation],
	);

	// 🎯 기사 수정
	const handleUpdateDriver = useCallback(
		async (data: UpdateDriverRequest) => {
			try {
				const result = await updateDriverMutation(data).unwrap();
				return { success: true, data: result };
			} catch (error: unknown) {
				if ("data" in (error as FetchBaseQueryError)) {
					const err = error as FetchBaseQueryError;
					throw new Error(
						(err.data as { error?: string })?.error ||
							"기사 정보 수정에 실패했습니다.",
					);
				}
				throw new Error("기사 정보 수정에 실패했습니다.");
			}
		},
		[updateDriverMutation],
	);

	// 🎯 기사 삭제
	const handleDeleteDriver = useCallback(
		async (driverId: string) => {
			try {
				await deleteDriverMutation(driverId).unwrap();
				return { success: true };
			} catch (error: unknown) {
				if ("data" in (error as FetchBaseQueryError)) {
					const err = error as FetchBaseQueryError;
					throw new Error(
						(err.data as { error?: string })?.error ||
							"기사 삭제에 실패했습니다.",
					);
				}
				throw new Error("기사 삭제에 실패했습니다.");
			}
		},
		[deleteDriverMutation],
	);

	// 마지막 생성된 비밀번호 초기화
	const handleClearLastPassword = useCallback(() => {
		setLastCreatedPassword(null);
	}, []);

	return {
		drivers,
		isLoading,
		error,
		lastCreatedPassword,
		loadDrivers,
		handleCreateDriver,
		handleUpdateDriver,
		handleDeleteDriver,
		handleClearLastPassword,
		// 셀렉터 결과
		driversByGroup,
		driverById,
		sortedDriversByGroup,
		sortedDriversByVehicleNumber,
	};
};

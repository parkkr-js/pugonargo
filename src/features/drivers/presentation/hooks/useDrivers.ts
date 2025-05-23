// src/features/drivers/presentation/hooks/useDrivers.ts
import { useState } from "react";
import {
	useCreateDriverMutation,
	useDeleteDriverMutation,
	useGetDriversQuery,
	useUpdateDriverMutation,
} from "../../application/api/driver.api";
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

	// 🔥 생성된 비밀번호 상태 (RTK Query는 서버 상태만 관리하므로 클라이언트 상태는 별도 관리)
	const [lastCreatedPassword, setLastCreatedPassword] = useState<string | null>(
		null,
	);

	// 기사 생성
	const handleCreateDriver = async (
		data: CreateDriverRequest,
	): Promise<boolean> => {
		try {
			const result = await createDriverMutation(data).unwrap();
			setLastCreatedPassword(result.password); // 🔥 비밀번호 상태 저장
			return true;
		} catch (error) {
			// 에러는 RTK Query에서 자동 처리됨
			return false;
		}
	};

	// 기사 수정
	const handleUpdateDriver = async (
		data: UpdateDriverRequest,
	): Promise<boolean> => {
		try {
			await updateDriverMutation(data).unwrap();
			return true;
		} catch (error) {
			// 에러는 RTK Query에서 자동 처리됨
			return false;
		}
	};

	// 기사 삭제
	const handleDeleteDriver = async (driverId: string): Promise<boolean> => {
		try {
			await deleteDriverMutation(driverId).unwrap();
			return true;
		} catch (error) {
			// 에러는 RTK Query에서 자동 처리됨
			return false;
		}
	};

	// 마지막 생성된 비밀번호 초기화
	const handleClearLastPassword = () => {
		setLastCreatedPassword(null);
	};

	return {
		drivers,
		isLoading,
		error: error ? "error" : null,
		lastCreatedPassword,
		loadDrivers,
		handleCreateDriver,
		handleUpdateDriver,
		handleDeleteDriver,
		handleClearLastPassword,
	};
};

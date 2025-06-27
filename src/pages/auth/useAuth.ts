import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/auth/authService";
import { useAuthStore } from "../../stores/authStore";
import { useDriverStore } from "../../stores/driverStore";
import type { UnifiedLoginRequest } from "../../types/auth";

const authService = new AuthService();

// 통합 로그인 훅 (아이디 형식에 따라 자동 구분)
export const useUnifiedLogin = () => {
	const { login, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);
	const setDriversDbSupplier = useDriverStore((s) => s.setDriversDbSupplier);

	return useMutation({
		// 실제 로그인 API를 호출하는 함수
		mutationFn: (credentials: UnifiedLoginRequest) =>
			authService.unifiedLogin(credentials),
		// API 호출 시작 전 실행
		onMutate: () => {
			setLoading(true);
		},
		// 로그인 성공 시 실행
		onSuccess: (user) => {
			login(user);
			if (user.role === "driver" && user.vehicleNumber) {
				setVehicleNumber(user.vehicleNumber);
				setDriversDbSupplier(user.driversDbSupplier || "");
			} else {
				setVehicleNumber("");
				setDriversDbSupplier("");
			}
		},
		// 에러 발생 시 실행
		onError: (error) => {
			setLoading(false);
			console.error("로그인 에러:", error);
		},
		// 성공/실패 상관없이 API 호출이 끝나면 실행
		onSettled: () => {
			setLoading(false);
		},
	});
};

// 로그아웃 훅
export const useLogout = () => {
	const { logout, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);
	const setDriversDbSupplier = useDriverStore((s) => s.setDriversDbSupplier);

	return useMutation({
		mutationFn: () => authService.logout(),
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			logout();
			setVehicleNumber(""); // 로그아웃 시 vehicleNumber 초기화
			setDriversDbSupplier(""); // 로그아웃 시 driversDbSupplier 초기화
		},
		onError: (error) => {
			console.error("로그아웃 에러:", error);
			// 에러가 발생해도 클라이언트 상태는 초기화
			logout();
			setVehicleNumber("");
			setDriversDbSupplier("");
		},
		onSettled: () => {
			setLoading(false);
		},
	});
};

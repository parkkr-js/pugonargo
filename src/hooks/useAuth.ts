import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { useDriverStore } from "../stores/driverStore";
import type {
	AdminLoginRequest,
	DriverLoginRequest,
	UnifiedLoginRequest,
} from "../types/auth";

const authService = new AuthService();

// 통합 로그인 훅 (아이디 형식에 따라 자동 구분)
export const useUnifiedLogin = () => {
	const { login, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);

	return useMutation({
		mutationFn: (credentials: UnifiedLoginRequest) =>
			authService.unifiedLogin(credentials),
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: (user) => {
			login(user);
			if (user.role === "driver" && user.vehicleNumber) {
				setVehicleNumber(user.vehicleNumber);
			} else {
				setVehicleNumber(""); // 관리자 등
			}
		},
		onError: (error) => {
			setLoading(false);
			console.error("로그인 에러:", error);
		},
		onSettled: () => {
			setLoading(false);
		},
	});
};

// 관리자 로그인 훅
export const useAdminLogin = () => {
	const { login, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);

	return useMutation({
		mutationFn: (credentials: AdminLoginRequest) =>
			authService.loginAdmin(credentials),
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: (user) => {
			login(user);
			setVehicleNumber(""); // 관리자는 vehicleNumber 없음
		},
		onError: (error) => {
			setLoading(false);
			console.error("관리자 로그인 에러:", error);
		},
		onSettled: () => {
			setLoading(false);
		},
	});
};

// 기사 로그인 훅
export const useDriverLogin = () => {
	const { login, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);

	return useMutation({
		mutationFn: (credentials: DriverLoginRequest) =>
			authService.loginDriver(credentials),
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: (user) => {
			login(user);
			if (user.vehicleNumber) {
				setVehicleNumber(user.vehicleNumber);
			} else {
				setVehicleNumber("");
			}
		},
		onError: (error) => {
			setLoading(false);
			console.error("기사 로그인 에러:", error);
		},
		onSettled: () => {
			setLoading(false);
		},
	});
};

// 로그아웃 훅
export const useLogout = () => {
	const { logout, setLoading } = useAuthStore();
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);

	return useMutation({
		mutationFn: () => authService.logout(),
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			logout();
			setVehicleNumber(""); // 로그아웃 시 vehicleNumber 초기화
		},
		onError: (error) => {
			console.error("로그아웃 에러:", error);
			// 에러가 발생해도 클라이언트 상태는 초기화
			logout();
			setVehicleNumber("");
		},
		onSettled: () => {
			setLoading(false);
		},
	});
};

// 사용자 역할
export type UserRole = "admin" | "driver";

// 사용자 정보
export interface User {
	id: string;
	role: UserRole;
	email?: string; // 관리자의 경우
	vehicleNumber?: string; // 기사의 경우
	group?: string; // 기사의 경우
}

// 통합 로그인 요청
export interface UnifiedLoginRequest {
	username: string; // 관리자는 이메일, 기사는 userId
	password: string;
}

// 로그인 요청 (관리자)
export interface AdminLoginRequest {
	email: string;
	password: string;
}

// 로그인 요청 (기사)
export interface DriverLoginRequest {
	userId: string;
	password: string;
}

// 기사 계정 정보 (DB에 저장되는 형태)
export interface DriverAccount {
	id: string;
	vehicleNumber: string;
	userId: string;
	password: string;
	group: string;
	dumpWeight: number;
	createdAt: string;
}

// 인증 상태
export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;

	// 액션
	login: (user: User) => void;
	logout: () => void;
	setLoading: (loading: boolean) => void;

	// 유틸리티
	isAdmin: () => boolean;
	isDriver: () => boolean;
}

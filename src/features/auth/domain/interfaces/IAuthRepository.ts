import type { AuthUser, LoginCredentials } from "../entities/AuthTypes";

export interface IAuthRepository {
	/**
	 * Firebase 인증을 수행하고 사용자 정보를 반환
	 * @param credentials 로그인 정보
	 * @returns 인증된 사용자 정보
	 */
	authenticate(credentials: LoginCredentials): Promise<AuthUser>;

	/**
	 * 사용자 로그아웃
	 */
	logout(): Promise<void>;

	/**
	 * 현재 세션 복구
	 * @returns 현재 인증된 사용자 정보 또는 null
	 */
	restoreSession(): Promise<AuthUser | null>;
}

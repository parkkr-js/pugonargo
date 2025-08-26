import { getGoogleRedirectUri } from "../../utils/redirectUtils";

/**
 * 배차용 Google OAuth 유틸리티 (Drive/Sheets 접근 토큰 관리)
 */
export class DispatchGoogleAuthService {
	private clientId: string;
	private scope: string;

	constructor() {
		this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
		this.scope =
			"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets";
	}

	/** 인증 URL 생성 */
	getAuthUrl(): string {
		const redirectUri = getGoogleRedirectUri();
		const params = new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: redirectUri,
			scope: this.scope,
			response_type: "token",
			include_granted_scopes: "true",
			state: `dispatch_${Math.random().toString(36).substring(2, 15)}`,
		});
		return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	}

	/** URL 해시에서 액세스 토큰 추출 */
	extractTokenFromUrl(): {
		access_token?: string;
		error?: string;
		expires_in?: number;
	} {
		const hash = window.location.hash.substring(1);
		const params = new URLSearchParams(hash);
		const expiresInStr = params.get("expires_in");
		return {
			access_token: params.get("access_token") || undefined,
			error: params.get("error") || undefined,
			expires_in: expiresInStr ? Number.parseInt(expiresInStr) : undefined,
		};
	}

	/** 로컬 스토리지에서 토큰 조회 */
	getStoredAccessToken(): string | null {
		return localStorage.getItem("dispatch_google_access_token");
	}

	/** 로컬 스토리지에 토큰 저장 */
	storeAccessToken(token: string): void {
		localStorage.setItem("dispatch_google_access_token", token);
	}

	/** 로컬 스토리지 토큰 삭제 */
	removeAccessToken(): void {
		localStorage.removeItem("dispatch_google_access_token");
	}

	/** 토큰 유효성 검사 */
	async validateToken(token: string): Promise<boolean> {
		try {
			const response = await fetch(
				`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
			);
			return response.ok;
		} catch {
			return false;
		}
	}

	/** OAuth 플로우 시작 */
	startOAuthFlow(): void {
		const authUrl = this.getAuthUrl();
		window.location.href = authUrl;
	}

	/** 로그아웃(저장된 토큰 제거) */
	logout(): void {
		this.removeAccessToken();
	}
}

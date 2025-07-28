import { getGoogleRedirectUri } from "../../utils/redirectUtils";

export class GoogleAuthService {
	private clientId: string;
	private scope: string;

	constructor() {
		this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
		this.scope =
			"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets";
	}

	/**
	 * Google OAuth 로그인 URL 생성 (Implicit Flow)
	 */
	getAuthUrl(): string {
		const redirectUri = getGoogleRedirectUri();
		const params = new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: redirectUri,
			scope: this.scope,
			response_type: "token", // Code 대신 token으로 직접 받기
			include_granted_scopes: "true",
			state: Math.random().toString(36).substring(2, 15), // CSRF 보호
		});

		return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	}

	/**
	 * URL 해시에서 액세스 토큰 추출 (Implicit Flow용)
	 */
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

	/**
	 * 저장된 액세스 토큰 가져오기
	 */
	getStoredAccessToken(): string | null {
		return localStorage.getItem("google_access_token");
	}

	/**
	 * 액세스 토큰 저장
	 */
	storeAccessToken(token: string): void {
		localStorage.setItem("google_access_token", token);
	}

	/**
	 * 액세스 토큰 제거
	 */
	removeAccessToken(): void {
		localStorage.removeItem("google_access_token");
	}

	/**
	 * 토큰 유효성 검사 (Google 서버와 실시간 통신)
	 */
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

	/**
	 * Google OAuth 로그인 시작
	 */
	startOAuthFlow(): void {
		const authUrl = this.getAuthUrl();
		window.location.href = authUrl;
	}

	/**
	 * 현재 인증 상태 확인
	 */
	async isAuthenticated(): Promise<boolean> {
		const token = this.getStoredAccessToken();
		if (!token) return false;

		return await this.validateToken(token);
	}

	/**
	 * 로그아웃
	 */
	logout(): void {
		this.removeAccessToken();
	}
}

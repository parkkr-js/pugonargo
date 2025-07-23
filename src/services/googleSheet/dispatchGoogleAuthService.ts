export class DispatchGoogleAuthService {
	private clientId: string;
	private redirectUri: string;
	private scope: string;

	constructor() {
		this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
		// 배차 페이지용 별도 리다이렉트 URI 사용
		this.redirectUri =
			process.env.REACT_APP_GOOGLE_DISPATCH_REDIRECT_URI ||
			process.env.REACT_APP_GOOGLE_REDIRECT_URI ||
			"";
		this.scope =
			"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets";
	}

	/**
	 * Google OAuth 로그인 URL 생성 (Implicit Flow)
	 */
	getAuthUrl(): string {
		const params = new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: this.redirectUri,
			scope: this.scope,
			response_type: "token", // Code 대신 token으로 직접 받기
			include_granted_scopes: "true",
			state: `dispatch_${Math.random().toString(36).substring(2, 15)}`, // 배차 페이지 식별을 위해 dispatch 포함
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
	 * 저장된 액세스 토큰 가져오기 (배차 전용)
	 */
	getStoredAccessToken(): string | null {
		return localStorage.getItem("dispatch_google_access_token");
	}

	/**
	 * 액세스 토큰 저장 (배차 전용)
	 */
	storeAccessToken(token: string, expiresIn?: number): void {
		localStorage.setItem("dispatch_google_access_token", token);

		if (expiresIn) {
			const expirationTime = Date.now() + expiresIn * 1000;
			localStorage.setItem(
				"dispatch_google_token_expires",
				expirationTime.toString(),
			);
		}
	}

	/**
	 * 액세스 토큰 제거 (배차 전용)
	 */
	removeAccessToken(): void {
		localStorage.removeItem("dispatch_google_access_token");
		localStorage.removeItem("dispatch_google_token_expires");
	}

	/**
	 * 토큰 만료 확인 (배차 전용)
	 */
	isTokenExpired(): boolean {
		const expirationTime = localStorage.getItem(
			"dispatch_google_token_expires",
		);
		if (!expirationTime) return false;

		return Date.now() >= Number.parseInt(expirationTime);
	}

	/**
	 * 토큰 유효성 검사
	 */
	async validateToken(token: string): Promise<boolean> {
		try {
			// 만료 시간 확인
			if (this.isTokenExpired()) {
				return false;
			}

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

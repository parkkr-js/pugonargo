import { getGoogleRedirectUri } from "../../utils/redirectUtils";

export class DispatchGoogleAuthService {
	private clientId: string;
	private scope: string;

	constructor() {
		this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
		this.scope =
			"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets";
	}

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

	getStoredAccessToken(): string | null {
		return localStorage.getItem("dispatch_google_access_token");
	}

	storeAccessToken(token: string): void {
		localStorage.setItem("dispatch_google_access_token", token);
	}

	removeAccessToken(): void {
		localStorage.removeItem("dispatch_google_access_token");
	}

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

	startOAuthFlow(): void {
		const authUrl = this.getAuthUrl();
		window.location.href = authUrl;
	}

	logout(): void {
		this.removeAccessToken();
	}
}

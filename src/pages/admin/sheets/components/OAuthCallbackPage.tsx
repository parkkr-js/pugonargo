import { Alert, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../../../../services/googleSheet/googleAuthService";

const googleAuthService = new GoogleAuthService();

export const OAuthCallbackPage = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleCallback = async () => {
			try {
				// URL 해시에서 토큰 추출 (Implicit Flow)
				const result = googleAuthService.extractTokenFromUrl();

				if (result.error) {
					setError(`인증 실패: ${result.error}`);
					setLoading(false);
					return;
				}

				if (!result.access_token) {
					setError("액세스 토큰을 받지 못했습니다.");
					setLoading(false);
					return;
				}

				// 토큰 저장
				googleAuthService.storeAccessToken(
					result.access_token,
					result.expires_in,
				);

				// URL 해시 정리 (보안)
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);

				// 연동 시트 관리 페이지로 이동
				navigate("/sheets", { replace: true });
			} catch (err) {
				setError(err instanceof Error ? err.message : "토큰 처리 실패");
				setLoading(false);
			}
		};

		handleCallback();
	}, [navigate]);

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					flexDirection: "column",
					gap: "16px",
				}}
			>
				<Spin size="large" />
				<div>Google 인증 처리 중...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					padding: "20px",
				}}
			>
				<Alert
					message="인증 오류"
					description={error}
					type="error"
					showIcon
					action={
						<div style={{ marginTop: "16px" }}>
							<button type="button" onClick={() => navigate("/sheets")}>
								연동 시트 관리로 돌아가기
							</button>
						</div>
					}
				/>
			</div>
		);
	}

	return null;
};

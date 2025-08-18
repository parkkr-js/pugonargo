import { Alert, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DispatchGoogleAuthService } from "../../../../services/dispatch/dispatchGoogleAuthService";
import { GoogleAuthService } from "../../../../services/sheet-management/googleAuthService";

const googleAuthService = new GoogleAuthService();
const dispatchGoogleAuthService = new DispatchGoogleAuthService();

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

				// URL의 state 파라미터를 확인하여 어디서 온 요청인지 판단
				const urlParams = new URLSearchParams(
					window.location.hash.substring(1),
				);
				const state = urlParams.get("state");

				// 배차 페이지에서 온 요청인지 확인 (state에 dispatch가 포함되어 있는지)
				const isFromDispatch = state?.includes("dispatch");

				if (isFromDispatch) {
					// 배차 페이지용 토큰 저장
					dispatchGoogleAuthService.storeAccessToken(result.access_token);

					// 배차 페이지로 이동
					navigate("/dispatch", { replace: true });
				} else {
					// 시트 관리 페이지용 토큰 저장
					googleAuthService.storeAccessToken(result.access_token);

					// 연동 시트 관리 페이지로 이동
					navigate("/sheets", { replace: true });
				}

				// URL 해시 정리 (보안)
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);
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

import { Alert, Button } from "antd";
import { memo } from "react";

interface AuthAlertProps {
	isAuthenticated: boolean;
	onAuth: () => void;
	onLogout: () => void;
}

export const AuthAlert = memo(
	({ isAuthenticated, onAuth, onLogout }: AuthAlertProps) => {
		if (!isAuthenticated) {
			return (
				<Alert
					message="Google 인증 필요"
					description="Google Drive와 Sheets API 사용을 위한 인증이 필요합니다."
					type="warning"
					showIcon
					style={{ marginBottom: "24px" }}
					action={
						<Button type="primary" onClick={onAuth}>
							Google 인증하기
						</Button>
					}
				/>
			);
		}

		return (
			<Alert
				message="Google 인증 완료"
				description="Google Drive와 Sheets API에 성공적으로 연결되었습니다."
				type="success"
				showIcon
				style={{ marginBottom: "24px" }}
				action={<Button onClick={onLogout}>인증 해제</Button>}
			/>
		);
	},
);

AuthAlert.displayName = "AuthAlert";

import { Alert, Card, Space } from "antd";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface AuthCardProps {
	accessToken: string | null;
	loading: boolean;
	onAuthSuccess: (token: string) => Promise<void>;
	onAuthError: () => void;
}

export const AuthCard = ({
	accessToken,
	loading,
	onAuthSuccess,
	onAuthError,
}: AuthCardProps) => (
	<Card title="구글 시트 → Firebase 연동" style={{ marginBottom: "24px" }}>
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Alert
				message="사용 방법"
				description="구글 계정을 연결한 후, 원하는 스프레드시트를 선택하면 자동으로 Firebase에 저장됩니다. 동일한 연월의 데이터는 기존 데이터를 덮어씁니다."
				type="info"
				showIcon
			/>

			<div style={{ textAlign: "center" }}>
				{!accessToken ? (
					<GoogleAuthButton
						onSuccess={onAuthSuccess}
						onError={onAuthError}
						loading={loading}
					/>
				) : (
					<div style={{ color: "#52c41a", fontSize: "16px" }}>
						✅ 구글 계정 연결됨
					</div>
				)}
			</div>
		</Space>
	</Card>
);

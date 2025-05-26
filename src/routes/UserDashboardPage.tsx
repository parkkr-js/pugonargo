// // src/routes/UserDashboardPage.tsx (일반 사용자용 모바일 페이지)

import { Card, Typography } from "antd";
import { useAuth } from "../features/auth/presentation/hooks/useAuth";

const { Title, Text } = Typography;

export const UserDashboardPage = () => {
	const { user } = useAuth();

	if (!user || user.userType !== "driver") {
		return null;
	}

	return (
		<div style={{ padding: "24px" }}>
			<Title level={2}>기사 정보</Title>
			<Card>
				<div style={{ marginBottom: "16px" }}>
					<Text strong>차량번호:</Text> {user.vehicleNumber}
				</div>
				<div style={{ marginBottom: "16px" }}>
					<Text strong>그룹번호:</Text> #{user.group}
				</div>
				<div style={{ marginBottom: "16px" }}>
					<Text strong>덤프중량:</Text> {user.dumpWeight}톤
				</div>
				<div>
					<Text strong>이메일:</Text> {user.email}
				</div>
			</Card>
		</div>
	);
};

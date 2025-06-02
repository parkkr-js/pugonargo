import { CarOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Layout, Space, Tag, Typography } from "antd";
import { withAuth } from "../../hoc/withAuth";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DriverPage = () => {
	const { user } = useAuthStore();
	const logout = useLogout();

	const handleLogout = () => {
		logout.mutate();
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{/* 헤더 */}
			<Header
				style={{
					backgroundColor: "#fff",
					padding: "0 24px",
					borderBottom: "1px solid #f0f0f0",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Title level={3} style={{ margin: 0, color: "#52c41a" }}>
					푸고나르고 기사님
				</Title>

				<Space>
					<Avatar icon={<UserOutlined />} />
					<Space direction="vertical" size={0}>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							<CarOutlined /> {user?.vehicleNumber} | <Tag>{user?.group}</Tag>
						</Text>
					</Space>
					<Button
						icon={<LogoutOutlined />}
						onClick={handleLogout}
						loading={logout.isPending}
					>
						로그아웃
					</Button>
				</Space>
			</Header>

			{/* 메인 콘텐츠 */}
			<Content style={{ padding: "24px" }}>
				<div style={{ maxWidth: 800, margin: "0 auto" }}>
					<Title level={2}>기사 업무 관리</Title>

					{/* 차량 정보 카드 */}
					<Card
						title="내 차량 정보"
						style={{ marginBottom: "16px" }}
						extra={<Tag color="green">{user?.group}</Tag>}
					>
						<Space direction="vertical" size="small">
							<Text>
								<strong>차량번호:</strong> {user?.vehicleNumber}
							</Text>
							<Text>
								<strong>소속 그룹:</strong> {user?.group}
							</Text>
						</Space>
					</Card>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
							gap: "16px",
							marginTop: "24px",
						}}
					>
						<Card title="주유 내역 등록" hoverable>
							<Text>주유한 내역을 등록하고 관리합니다.</Text>
							<br />
							<Button type="primary" style={{ marginTop: "16px" }}>
								주유 내역 등록
							</Button>
						</Card>

						<Card title="정비 내역 등록" hoverable>
							<Text>차량 정비 내역을 등록하고 관리합니다.</Text>
							<br />
							<Button type="primary" style={{ marginTop: "16px" }}>
								정비 내역 등록
							</Button>
						</Card>

						<Card title="내 기록 보기" hoverable>
							<Text>지금까지 등록한 주유/정비 내역을 확인합니다.</Text>
							<br />
							<Button style={{ marginTop: "16px" }}>기록 보기</Button>
						</Card>

						<Card title="월별 요약" hoverable>
							<Text>이번 달 주유비, 정비비 요약을 확인합니다.</Text>
							<br />
							<Button style={{ marginTop: "16px" }}>요약 보기</Button>
						</Card>
					</div>
				</div>
			</Content>
		</Layout>
	);
};

// HOC로 인증 보호 (기사도 로그인 필요)
export default withAuth(DriverPage);

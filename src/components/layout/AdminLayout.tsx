import {
	DashboardOutlined,
	FileTextOutlined,
	LogoutOutlined,
	TableOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

interface AdminLayoutProps {
	children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const logout = useLogout();
	const { user } = useAuthStore();
	const [collapsed, setCollapsed] = useState(false);

	// 현재 경로에 따른 선택된 메뉴 키
	const getSelectedKey = () => {
		const path = location.pathname;
		if (path === "/dashboard") return "dashboard";
		if (path === "/transactions") return "transactions";
		if (path === "/drivers") return "drivers";
		if (path === "/sheets") return "sheets";
		return "dashboard";
	};

	// 메뉴 아이템 설정
	const menuItems = [
		{
			key: "dashboard",
			icon: <DashboardOutlined />,
			label: "대시보드",
			onClick: () => navigate("/dashboard"),
		},
		{
			key: "transactions",
			icon: <FileTextOutlined />,
			label: "거래 내역",
			onClick: () => navigate("/transactions"),
		},
		{
			key: "drivers",
			icon: <TeamOutlined />,
			label: "기사님 관리",
			onClick: () => navigate("/drivers"),
		},
		{
			key: "sheets",
			icon: <TableOutlined />,
			label: "연동 시트 관리",
			onClick: () => navigate("/sheets"),
		},
	];

	// 로그아웃 처리
	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
			navigate("/login");
		} catch (error) {
			console.error("로그아웃 실패:", error);
		}
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{/* 사이드바 */}
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				width={240}
				style={{
					background: "#2f3349",
					boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
				}}
			>
				{/* 로고/타이틀 */}
				<div
					style={{
						padding: "24px 16px",
						textAlign: "center",
						borderBottom: "1px solid #404040",
					}}
				>
					{!collapsed ? (
						<Title
							level={3}
							style={{ color: "white", margin: 0, fontSize: "18px" }}
						>
							푸고나르고(P&N)
						</Title>
					) : (
						<Title
							level={3}
							style={{ color: "white", margin: 0, fontSize: "16px" }}
						>
							P&N
						</Title>
					)}
				</div>

				{/* 메뉴 */}
				<Menu
					theme="dark"
					mode="inline"
					selectedKeys={[getSelectedKey()]}
					style={{
						background: "transparent",
						border: "none",
						marginTop: "16px",
					}}
					items={menuItems}
				/>
			</Sider>

			{/* 메인 콘텐츠 영역 */}
			<Layout>
				{/* 헤더 */}
				<Header
					style={{
						background: "white",
						padding: "0 24px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div>
						<Text type="secondary">전체 거래 현황을 파악해보세요</Text>
					</div>

					{/* 사용자 정보 및 로그아웃 */}
					<Space>
						<Text strong>관리자({user?.email || "Unknown"})</Text>
						<Text type="secondary">|</Text>
						<Button
							type="text"
							icon={<LogoutOutlined />}
							onClick={handleLogout}
							loading={logout.isPending}
						>
							로그아웃
						</Button>
					</Space>
				</Header>

				{/* 메인 콘텐츠 */}
				<Content
					style={{
						margin: "24px",
						padding: "24px",
						background: "white",
						borderRadius: "8px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
						minHeight: "calc(100vh - 112px)",
					}}
				>
					{children}
				</Content>
			</Layout>
		</Layout>
	);
};

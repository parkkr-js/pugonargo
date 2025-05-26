// src/ui/deskTop/components/Layout.tsx
import {
	BarChartOutlined,
	FileExcelOutlined,
	HomeOutlined,
	LogoutOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Layout as AntLayout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/presentation/hooks/useAuth";

const { Header, Content, Sider } = AntLayout;

export const Layout = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, isAdmin, logout } = useAuth();

	const handleMenuClick = (key: string) => {
		if (key === "logout") {
			logout();
			navigate("/login");
			return;
		}
		navigate(key);
	};

	const menuItems = isAdmin
		? [
				{
					key: "/admin",
					icon: <HomeOutlined />,
					label: "대시보드",
				},
				{
					key: "/admin/transaction-statement",
					icon: <BarChartOutlined />,
					label: "거래 내역",
				},
				{
					key: "/admin/manage-drivers",
					icon: <UserOutlined />,
					label: "기사님 관리",
				},
				{
					key: "/admin/manage-google-sheets",
					icon: <FileExcelOutlined />,
					label: "연동 시트 관리",
				},
				{
					key: "logout",
					icon: <LogoutOutlined />,
					label: "로그아웃",
				},
			]
		: [
				{
					key: "/driver",
					icon: <HomeOutlined />,
					label: "홈",
				},
				{
					key: "/driver/profile",
					icon: <UserOutlined />,
					label: "프로필",
				},
				{
					key: "logout",
					icon: <LogoutOutlined />,
					label: "로그아웃",
				},
			];

	return (
		<AntLayout style={{ minHeight: "100vh" }}>
			<Header
				style={{
					padding: "0 24px",
					background: "#fff",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div style={{ fontSize: "18px", fontWeight: "bold" }}>
					{isAdmin ? "관리자 패널" : "기사님 대시보드"}
				</div>
				<div style={{ fontSize: "14px", color: "#666" }}>
					{isAdmin ? `관리자(${user?.userType})` : `기사님(${user?.userType})`}
				</div>
			</Header>
			<AntLayout>
				<Sider width={200} style={{ background: "#fff" }}>
					<Menu
						mode="inline"
						selectedKeys={[location.pathname]}
						style={{ height: "100%", borderRight: 0 }}
						items={menuItems}
						onClick={({ key }) => handleMenuClick(key)}
					/>
				</Sider>
				<AntLayout style={{ padding: "24px" }}>
					<Content
						style={{
							padding: 24,
							margin: 0,
							minHeight: 280,
							background: "#fff",
							borderRadius: "8px",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
						}}
					>
						{/* Outlet이 자식 라우트들을 렌더링 */}
						<Outlet />
					</Content>
				</AntLayout>
			</AntLayout>
		</AntLayout>
	);
};

//src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../ui/deskTop/components/Layout";
import { DashboardPage } from "./DashboardPage";
import LoginPage from "./LoginPage";
import { ManageDriversPage } from "./ManageDriversPage";
import { withAuth } from "./hoc/withAuth";
// import { ManageGoogleSheetsPage } from "./ManageGoogleSheetsPage";

// import { TransactionHistoryPage } from "./TransactionHistoryPage";
import { UserDashboardPage } from "./UserDashboardPage";

// HOC로 감싼 컴포넌트들
const ProtectedLayout = withAuth(Layout, true);
const ProtectedUserDashboard = withAuth(UserDashboardPage);

export const router = createBrowserRouter([
	{
		path: "/admin",
		element: <ProtectedLayout />,
		children: [
			{
				index: true, // /admin 경로에서 기본으로 보여줄 페이지
				element: <DashboardPage />,
			},
			{
				path: "manage-drivers",
				element: <ManageDriversPage />,
			},
			// {
			//   path: "transaction-history",
			//   element: <TransactionHistoryPage />,
			// },
			// {
			//   path: "manage-google-sheets",
			//   element: <ManageGoogleSheetsPage />,
			// },
		],
	},
	{
		path: "/driver",
		element: <ProtectedUserDashboard />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/",
		element: <LoginPage />,
	},
	{
		path: "*",
		element: <LoginPage />,
	},
]);

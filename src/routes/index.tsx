//src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../ui/deskTop/components/Layout";
import { DashboardPage } from "./DashboardPage";
import LoginPage from "./LoginPage";
import { ManageDriversPage } from "./ManageDriversPage";
import { ManageGoogleSheetsPage } from "./ManageGoogleSheetsPage";
import { TransactionStatementPage } from "./TransactionStatementPage";
import { UserDashboardPage } from "./UserDashboardPage";
import { withAuth } from "./hoc/withAuth";

// HOC로 감싼 컴포넌트들
const ProtectedLayout = withAuth(Layout, true);
const ProtectedUserDashboard = withAuth(UserDashboardPage);

export const router = createBrowserRouter([
	{
		path: "/admin",
		element: <ProtectedLayout />,
		children: [
			{
				index: true,
				element: <DashboardPage />,
			},
			{
				path: "transaction-statement",
				element: <TransactionStatementPage />,
			},
			{
				path: "manage-drivers",
				element: <ManageDriversPage />,
			},
			{
				path: "manage-google-sheets",
				element: <ManageGoogleSheetsPage />,
			},
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

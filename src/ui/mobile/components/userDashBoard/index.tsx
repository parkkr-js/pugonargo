// ===================================================================
// 🔥 src/ui/mobile/components/userDashBoard/index.tsx
// ===================================================================

import { ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";
import DailyRecord from "./dailyRecord";
import StatisticsByPeriod from "./statisticsByPeriod";

const UserDashboard = () => {
	const tabItems: TabsProps["items"] = [
		{
			key: "statistics",
			label: "기간별 통계",
			children: <StatisticsByPeriod />,
		},
		{
			key: "daily",
			label: "일별 기록",
			children: <DailyRecord />,
		},
	];

	return (
		<ConfigProvider
			theme={{
				components: {
					Tabs: {
						inkBarColor: "#1E266F",
						itemSelectedColor: "#1E266F",
					},
				},
			}}
		>
			<Tabs defaultActiveKey="statistics" items={tabItems} centered />
		</ConfigProvider>
	);
};

export default UserDashboard;

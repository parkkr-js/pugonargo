import { Card, Layout } from "antd";
import { useState } from "react";
import { DailyRecordsTab } from "./components/DailyRecordsTab";
import { Header } from "./components/Header";
import { PeriodStatsTab } from "./components/PeriodStatsTab";
import { TabBar } from "./components/TabBar";
import { useCurrentDriverVehicleNumber } from "./hooks/useCurrentDriverVehicleNumber";

const { Content } = Layout;

export default function DriverPage() {
	const [activeTab, setActiveTab] = useState<"period" | "daily">("period");
	const vehicleNumber = useCurrentDriverVehicleNumber();

	// vehicleNumber가 없으면 로그인 페이지로 리다이렉트
	if (!vehicleNumber) {
		window.location.href = "/login";
		return null;
	}

	return (
		<Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
			<Content
				style={{
					maxWidth: 498,
					margin: "0 auto",
					width: "100%",
					overflowX: "hidden",
					padding: 0,
				}}
			>
				<Card
					styles={{ body: { padding: 0, height: "100%" } }}
					style={{
						height: "100vh",
						maxWidth: 498,
						width: "100%",
						overflowX: "hidden",
						padding: 0,
						margin: "0 auto",
					}}
				>
					<Layout style={{ height: "100%", overflowX: "hidden" }}>
						<Header />
						<TabBar activeTab={activeTab} onChange={setActiveTab} />
						<Content
							style={{
								flex: 1,
								overflow: "auto",
								overflowX: "hidden",
								width: "100%",
							}}
						>
							{activeTab === "period" ? (
								<PeriodStatsTab />
							) : (
								<DailyRecordsTab />
							)}
						</Content>
					</Layout>
				</Card>
			</Content>
		</Layout>
	);
}

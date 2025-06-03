import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useDriverStore } from "../../stores/driverStore";
import { DailyRecordsTab } from "./components/DailyRecordsTab";
import { Header } from "./components/Header";
import { PeriodStatsTab } from "./components/PeriodStatsTab";
import { TabBar } from "./components/TabBar";
import { useCurrentDriverVehicleNumber } from "./hooks/useCurrentDriverVehicleNumber";

export default function DriverPage() {
	const [activeTab, setActiveTab] = useState<"period" | "daily">("period");
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);
	const vehicleNumber = useCurrentDriverVehicleNumber();

	// vehicleNumber가 없으면 로그인 페이지로 리다이렉트
	if (!vehicleNumber) {
		window.location.href = "/login";
		return null;
	}

	const handleLogout = () => {
		setVehicleNumber("");
		useAuthStore.getState().logout();
		window.location.href = "/login";
	};

	return (
		<div
			style={{
				maxWidth: 498,
				margin: "0 auto",
				background: "#fff",
				minHeight: "100vh",
				boxShadow: "0 0 8px 0 rgba(0,0,0,0.04)",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Header onLogout={handleLogout} />
			<TabBar activeTab={activeTab} onChange={setActiveTab} />
			<div style={{ flex: 1, overflow: "auto" }}>
				{activeTab === "period" ? <PeriodStatsTab /> : <DailyRecordsTab />}
			</div>
		</div>
	);
}

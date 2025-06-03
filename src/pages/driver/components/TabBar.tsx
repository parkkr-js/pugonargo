interface TabBarProps {
	activeTab: "period" | "daily";
	onChange: (tab: "period" | "daily") => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
	return (
		<div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
			<button
				style={{
					flex: 1,
					padding: 12,
					fontWeight: activeTab === "period" ? 700 : 400,
					background: "none",
					border: "none",
					borderBottom: activeTab === "period" ? "2px solid #222" : "none",
					color: activeTab === "period" ? "#222" : "#888",
					fontSize: 16,
				}}
				type="button"
				onClick={() => onChange("period")}
			>
				기간별 통계
			</button>
			<button
				type="button"
				style={{
					flex: 1,
					padding: 12,
					fontWeight: activeTab === "daily" ? 700 : 400,
					background: "none",
					border: "none",
					borderBottom: activeTab === "daily" ? "2px solid #222" : "none",
					color: activeTab === "daily" ? "#222" : "#888",
					fontSize: 16,
				}}
				onClick={() => onChange("daily")}
			>
				일별 기록
			</button>
		</div>
	);
}

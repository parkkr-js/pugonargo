interface CostSummaryProps {
	totalRepair: number;
	totalFuel: number;
	totalCost: number;
}

export function CostSummary({
	totalRepair,
	totalFuel,
	totalCost,
}: CostSummaryProps) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 16,
				margin: "32px 0 16px 0",
			}}
		>
			<div style={summaryCardStyle}>
				<div style={summaryLabelStyle}>총 비용</div>
				<div style={summaryValueStyle}>{totalCost.toLocaleString()} 원</div>
			</div>
			<span style={{ fontSize: 28, fontWeight: 700 }}>=</span>
			<div style={summaryCardStyle}>
				<div style={summaryLabelStyle}>총 정비비용</div>
				<div style={summaryValueStyle}>{totalRepair.toLocaleString()} 원</div>
			</div>
			<span style={{ fontSize: 28, fontWeight: 700 }}>+</span>
			<div style={summaryCardStyle}>
				<div style={summaryLabelStyle}>총 유류비</div>
				<div style={summaryValueStyle}>{totalFuel.toLocaleString()} 원</div>
			</div>
		</div>
	);
}

const summaryCardStyle = {
	flex: 1,
	background: "#fff",
	borderRadius: 12,
	padding: "16px 12px",
	textAlign: "center" as const,
	boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
	border: "1px solid #eee",
};
const summaryLabelStyle = { color: "#888", fontSize: 14, marginBottom: 8 };
const summaryValueStyle = { color: "#223388", fontWeight: 700, fontSize: 20 };

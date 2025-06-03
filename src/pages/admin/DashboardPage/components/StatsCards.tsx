interface StatsCardsProps {
	stats?: {
		totalI: number;
		totalO: number;
	} | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
	const totalI = stats?.totalI ?? 0;
	const totalO = stats?.totalO ?? 0;
	const totalISupply = totalI;
	const totalIWithTax = Math.round(totalI * 1.1);
	const totalOSupply = totalO;
	const totalOWithTax = Math.round(totalO * 1.1);

	return (
		<div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
			<div style={cardStyle}>
				<div style={labelStyle}>총 청구금액(부가세 포함)</div>
				<div style={valueStyle}>{totalIWithTax.toLocaleString()} 원</div>
			</div>
			<div style={cardStyle}>
				<div style={labelStyle}>총 청구금액(공급가)</div>
				<div style={valueStyle}>{totalISupply.toLocaleString()} 원</div>
			</div>
			<div style={cardStyle}>
				<div style={labelStyle}>총 지급금액</div>
				<div style={valueStyle}>{totalOWithTax.toLocaleString()} 원</div>
			</div>
			<div style={cardStyle}>
				<div style={labelStyle}>총 지급금액(공급가)</div>
				<div style={valueStyle}>{totalOSupply.toLocaleString()} 원</div>
			</div>
		</div>
	);
}

const cardStyle = {
	flex: 1,
	background: "#f8fafd",
	borderRadius: 12,
	padding: "16px 12px",
	textAlign: "center" as const,
	boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
};
const labelStyle = { color: "#888", fontSize: 14, marginBottom: 8 };
const valueStyle = { color: "#223388", fontWeight: 700, fontSize: 20 };

interface StatCardProps {
	data?: {
		totalAmount: number;
		totalDeduction: number;
		afterDeduction: number;
		totalFuelCost: number;
		totalRepairCost: number;
	};
	loading?: boolean;
}

export function StatCard({ data, loading }: StatCardProps) {
	if (!data) return null;
	return (
		<div
			style={{
				border: "1px solid #eee",
				borderRadius: 8,
				padding: 16,
				background: "#fafbfc",
			}}
		>
			<div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
				선택 기간 운행 매출
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 4,
				}}
			>
				<span>총 금액</span>
				<span>{data.totalAmount.toLocaleString()}원</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 4,
				}}
			>
				<span>지입료(5%)</span>
				<span>{data.totalDeduction.toLocaleString()}원</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<span>공제 후 금액</span>
				<span>{data.afterDeduction.toLocaleString()}원</span>
			</div>
			<hr style={{ margin: "12px 0" }} />
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 4,
				}}
			>
				<span>총 유류비</span>
				<span>{data.totalFuelCost.toLocaleString()}원</span>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<span>총 정비비</span>
				<span>{data.totalRepairCost.toLocaleString()}원</span>
			</div>
		</div>
	);
}

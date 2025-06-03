interface StatCardProps {
	data?: {
		totalAmount: number;
		totalDeduction: number;
		afterDeduction: number;
		totalFuelCost: number;
		totalRepairCost: number;
	};
}

export function StatCard({ data }: StatCardProps) {
	const totalAmount = data?.totalAmount ?? 0;
	const totalDeduction = data?.totalDeduction ?? 0;
	const afterDeduction = Math.round(data?.afterDeduction ?? 0);
	const totalFuelCost = data?.totalFuelCost ?? 0;
	const totalRepairCost = data?.totalRepairCost ?? 0;

	return (
		<div
			style={{
				border: "1px solid #eee",
				borderRadius: 12,
				padding: 24,
				background: "#fff",
				boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
				maxWidth: 420,
				margin: "0 auto",
			}}
		>
			<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
				선택 기간 운행 매출
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<span>총 금액</span>
				<span style={{ color: "#222", fontWeight: 600, fontSize: 18 }}>
					{totalAmount.toLocaleString()}원
				</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<span>지입료(5%)</span>
				<span style={{ color: "#222", fontWeight: 600, fontSize: 18 }}>
					{totalDeduction.toLocaleString()}원
				</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 16,
				}}
			>
				<span>공제 후 금액</span>
				<span style={{ color: "#223388", fontWeight: 900, fontSize: 20 }}>
					{afterDeduction.toLocaleString()}원
				</span>
			</div>
			<hr style={{ margin: "16px 0" }} />
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<span>총 유류비</span>
				<span style={{ color: "#223388", fontWeight: 700, fontSize: 17 }}>
					{totalFuelCost.toLocaleString()}원
				</span>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<span>총 정비비</span>
				<span style={{ color: "#223388", fontWeight: 700, fontSize: 17 }}>
					{totalRepairCost.toLocaleString()}원
				</span>
			</div>
		</div>
	);
}

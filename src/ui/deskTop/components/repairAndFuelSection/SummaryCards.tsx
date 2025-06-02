import type React from "react";

interface Props {
	totalCost: number;
	totalRepairCost: number;
	totalFuelCost: number;
}

const SummaryCards = ({ totalCost, totalRepairCost, totalFuelCost }: Props) => (
	<div
		style={{
			display: "flex",
			gap: 16,
			marginBottom: 24,
			alignItems: "center",
			fontSize: 16,
			fontWeight: 500,
		}}
	>
		<div
			style={{
				padding: "12px 16px",
				backgroundColor: "#f0f2ff",
				borderRadius: 8,
				border: "1px solid #d6e4ff",
			}}
		>
			총 비용
			<br />
			<span style={{ fontSize: 20, fontWeight: 700, color: "#1890ff" }}>
				{totalCost.toLocaleString()} 원
			</span>
		</div>
		<div style={{ fontSize: 24, color: "#666" }}>=</div>
		<div
			style={{
				padding: "12px 16px",
				backgroundColor: "#fff2e8",
				borderRadius: 8,
				border: "1px solid #ffd8bf",
			}}
		>
			총 정비비용
			<br />
			<span style={{ fontSize: 18, fontWeight: 600, color: "#fa8c16" }}>
				{totalRepairCost.toLocaleString()} 원
			</span>
		</div>
		<div style={{ fontSize: 24, color: "#666" }}>+</div>
		<div
			style={{
				padding: "12px 16px",
				backgroundColor: "#f6ffed",
				borderRadius: 8,
				border: "1px solid #b7eb8f",
			}}
		>
			총 유류비
			<br />
			<span style={{ fontSize: 18, fontWeight: 600, color: "#52c41a" }}>
				{totalFuelCost.toLocaleString()} 원
			</span>
		</div>
	</div>
);

export default SummaryCards;

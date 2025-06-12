import styled from "styled-components";

interface CostSummaryProps {
	rows: {
		type: "fuel" | "repair";
		cost: number;
	}[];
}

export function CostSummary({ rows }: CostSummaryProps) {
	const totalRepair = rows
		.filter((r) => r.type === "repair")
		.reduce((sum, r) => sum + r.cost, 0);
	const totalFuel = rows
		.filter((r) => r.type === "fuel")
		.reduce((sum, r) => sum + r.cost, 0);
	const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);

	return (
		<CardRow>
			<StatCard>
				<StatLabel>총 비용</StatLabel>
				<StatValue>{totalCost.toLocaleString()} 원</StatValue>
			</StatCard>
			<Operator>=</Operator>
			<StatCard>
				<StatLabel>총 정비비용</StatLabel>
				<StatValue>{totalRepair.toLocaleString()} 원</StatValue>
			</StatCard>
			<Operator>+</Operator>
			<StatCard>
				<StatLabel>총 유류비</StatLabel>
				<StatValue>{totalFuel.toLocaleString()} 원</StatValue>
			</StatCard>
		</CardRow>
	);
}

const CardRow = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
`;

const StatCard = styled.div`
	flex: 1;
	background: transparent;
	border-radius: ${({ theme }) => theme.borderRadius.xl};
	padding: 16px 12px;
	text-align: center;
	box-shadow: ${({ theme }) => theme.shadows.xs};
	display: flex;
	flex-direction: column;
	align-items: center;
	border: 1.5px solid ${({ theme }) => theme.colors.border.light};
`;

const StatLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	margin-bottom: 8px;
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StatValue = styled.div`
	color: ${({ theme }) => theme.colors.gray[900]};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const Operator = styled.span`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.gray[500]};
	margin: 0 8px;
`;

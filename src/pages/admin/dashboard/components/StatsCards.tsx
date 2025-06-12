import styled from "styled-components";

interface StatsCardsProps {
	stats?: {
		totalI: number;
		totalO: number;
	} | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
	const totalI = stats?.totalI ?? 0;
	const totalO = stats?.totalO ?? 0;
	const totalISupply = Math.round(totalI);
	const totalIWithTax = Math.round(totalI * 1.1);
	const totalOSupply = Math.round(totalO);
	const totalOWithTax = Math.round(totalO * 1.1);

	return (
		<CardRow>
			<StatCard>
				<StatLabel>총 청구금액(부가세 포함)</StatLabel>
				<StatValue>{totalIWithTax.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 청구금액(공급가)</StatLabel>
				<StatValue>{totalISupply.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 지급금액</StatLabel>
				<StatValue>{totalOWithTax.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 지급금액(공급가)</StatLabel>
				<StatValue>{totalOSupply.toLocaleString()} 원</StatValue>
			</StatCard>
		</CardRow>
	);
}

const CardRow = styled.div`
	display: flex;
	gap: 16px;
`;

const StatCard = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.xl};
	padding: 16px 12px;
	text-align: center;
	box-shadow: ${({ theme }) => theme.shadows.xs};
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const StatLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	margin-bottom: 8px;
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StatValue = styled.div`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	font-size: ${({ theme }) => theme.fontSizes.xl};
`;

import { useMemo } from "react";
import styled from "styled-components";
import type { TableTransaction } from "../../../../types/transaction";

interface SummaryCardsProps {
	data: TableTransaction[];
}

export function SummaryCards({ data }: SummaryCardsProps) {
	const summary = useMemo(() => {
		const totalI = data.reduce((sum, record) => sum + record.i, 0);
		const totalO = data.reduce((sum, record) => sum + record.amount, 0);

		return {
			totalI,
			totalO,
		};
	}, [data]);

	const totalISupply = Math.round(summary.totalI);
	const totalIWithTax = Math.round(summary.totalI * 1.1);
	const totalOSupply = Math.round(summary.totalO);
	const totalOWithTax = Math.round(summary.totalO * 1.1);

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

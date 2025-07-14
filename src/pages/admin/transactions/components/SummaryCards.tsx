import { useMemo } from "react";
import styled from "styled-components";
import type { TableTransaction } from "../../../../types/transaction";

interface SummaryCardsProps {
	data: TableTransaction[];
}

export function SummaryCards({ data }: SummaryCardsProps) {
	const summary = useMemo(() => {
		// G*H 계산 (weight * billingUnitPrices)
		const totalGH = data.reduce((sum, record) => {
			const ghAmount = record.weight * record.billingUnitPrices;

			return sum + ghAmount;
		}, 0);

		// M*N 계산 (payOutweights * unitPrice)
		const totalMN = data.reduce((sum, record) => {
			const mnAmount = record.payOutweights * record.unitPrice;

			return sum + mnAmount;
		}, 0);

		return {
			totalGH,
			totalMN,
		};
	}, [data]);

	// 공급가 (G*H의 합, M*N의 합)
	const totalGHSupply = Math.round(summary.totalGH);
	const totalMNSupply = Math.round(summary.totalMN);

	// 부가세 포함 (공급가 * 1.1)
	const totalGHWithTax = Math.round(totalGHSupply * 1.1);
	const totalMNWithTax = Math.round(totalMNSupply * 1.1);

	return (
		<CardRow>
			<StatCard>
				<StatLabel>총 청구금액(부가세 포함)</StatLabel>
				<StatValue>{totalGHWithTax.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 청구금액(공급가)</StatLabel>
				<StatValue>{totalGHSupply.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 지급금액</StatLabel>
				<StatValue>{totalMNWithTax.toLocaleString()} 원</StatValue>
			</StatCard>
			<StatCard>
				<StatLabel>총 지급금액(공급가)</StatLabel>
				<StatValue>{totalMNSupply.toLocaleString()} 원</StatValue>
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

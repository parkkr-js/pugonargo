import styled from "styled-components";

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
		<CardContainer>
			<Title>선택 기간 운행 매출</Title>
			<Row>
				<span>총 금액</span>
				<Amount>{totalAmount.toLocaleString()}원</Amount>
			</Row>
			<Row>
				<span>지입료(5%)</span>
				<Amount>{totalDeduction.toLocaleString()}원</Amount>
			</Row>
			<Row style={{ marginBottom: 12, fontWeight: 600 }}>
				<span>공제 후 금액</span>
				<AfterDeduction>{afterDeduction.toLocaleString()}원</AfterDeduction>
			</Row>
			<StyledHr />
			<Row>
				<span>총 유류비</span>
				<Amount>{totalFuelCost.toLocaleString()}원</Amount>
			</Row>
			<Row>
				<span>총 정비비</span>
				<Amount>{totalRepairCost.toLocaleString()}원</Amount>
			</Row>
		</CardContainer>
	);
}

const CardContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: #fff;
  box-shadow: ${({ theme }) => theme.shadows.md};
  max-width: 420px;
  margin: 0 auto;
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: black;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Amount = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.normal};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const AfterDeduction = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const StyledHr = styled.hr`
  margin: ${({ theme }) => theme.spacing.md} 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

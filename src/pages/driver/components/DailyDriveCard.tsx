import styled from "styled-components";

interface DailyDriveCardProps {
	record: {
		id: string;
		e: string; // 운송구간
		m: number; // 지급중량 (number)
		q: number; // 단가 (number)
		o: number; // 공제 후 금액 (number)
	};
}

export function DailyDriveCard({ record }: DailyDriveCardProps) {
	const m = typeof record.m === "number" ? record.m : Number(record.m) || 0;
	const q = typeof record.q === "number" ? record.q : Number(record.q) || 0;
	const o = Math.round(
		typeof record.o === "number" ? record.o : Number(record.o) || 0,
	);

	const totalAmount = Math.round(q * m);
	const deduction = Math.round(totalAmount * 0.05);

	return (
		<Card>
			<InfoRow>
				<InfoLabel>운송구간</InfoLabel>
				<InfoValue>{record.e}</InfoValue>
			</InfoRow>
			<InfoRow>
				<InfoLabel>지급중량</InfoLabel>
				<InfoValue>{m.toLocaleString()}</InfoValue>
			</InfoRow>
			<InfoRow>
				<InfoLabel>총 금액</InfoLabel>
				<PrimaryValue>{totalAmount.toLocaleString()}원</PrimaryValue>
			</InfoRow>
			<InfoRow>
				<InfoLabel>지입료(5%)</InfoLabel>
				<PrimaryValue>{deduction.toLocaleString()}원</PrimaryValue>
			</InfoRow>
			<InfoRow>
				<InfoLabelStrong>공제 후 금액</InfoLabelStrong>
				<FinalValue>{o.toLocaleString()}원</FinalValue>
			</InfoRow>
		</Card>
	);
}

const Card = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid #eee;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: ${({ theme }) => theme.spacing.md};
	background: #fff;
	box-shadow: ${({ theme }) => theme.shadows.card};
	gap: ${({ theme }) => theme.spacing.sm};
`;

const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	font-size: ${({ theme }) => theme.fontSizes.lg};
	&:last-child {
		margin-bottom: 0;
	}
`;

const InfoLabel = styled.span`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-weight: ${({ theme }) => theme.fontWeights.normal};
`;

const InfoLabelStrong = styled(InfoLabel)`
	font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const InfoValue = styled.span`
	color: ${({ theme }) => theme.colors.text.primary};
`;

const PrimaryValue = styled(InfoValue)`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const FinalValue = styled(PrimaryValue)`
	font-size: ${({ theme }) => theme.fontSizes.xl};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

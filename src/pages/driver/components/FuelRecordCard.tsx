import styled from "styled-components";

export interface FuelRecord {
	id: string;
	unitPrice: number;
	fuelAmount: number;
	totalFuelCost: number;
	date: string;
	vehicleNumber: string;
}
interface FuelRecordCardProps {
	record: FuelRecord;
	onEdit?: (record: FuelRecord) => void;
	onDelete?: (id: string) => void;
}
export function FuelRecordCard({
	record,
	onEdit,
	onDelete,
}: FuelRecordCardProps) {
	const handleDelete = () => {
		if (window.confirm("정말 삭제하시겠습니까?")) {
			onDelete?.(record.id);
		}
	};

	return (
		<Card>
			<InfoRow>
				<InfoLabel>단가</InfoLabel>
				<InfoValue>{record.unitPrice.toLocaleString()}원</InfoValue>
			</InfoRow>
			<InfoRow>
				<InfoLabel>주유량</InfoLabel>
				<InfoValue>{record.fuelAmount.toLocaleString()}L</InfoValue>
			</InfoRow>
			<InfoRow>
				<InfoLabel>총주유비</InfoLabel>
				<PrimaryValue>{record.totalFuelCost.toLocaleString()}원</PrimaryValue>
			</InfoRow>
			<ButtonRow>
				<ActionButton type="button" onClick={() => onEdit?.(record)}>
					수정
				</ActionButton>
				<DeleteButton type="button" onClick={handleDelete}>
					삭제
				</DeleteButton>
			</ButtonRow>
		</Card>
	);
}

const Card = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid #eee;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: ${({ theme }) => theme.spacing.md};
	background: #f8fafd;
	box-shadow: ${({ theme }) => theme.shadows.card};
	gap: ${({ theme }) => theme.spacing.sm};
`;

const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	font-size: ${({ theme }) => theme.fontSizes.md};
	&:last-child {
		margin-bottom: 0;
	}
`;

const InfoLabel = styled.span`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-weight: ${({ theme }) => theme.fontWeights.normal};
`;

const InfoValue = styled.span`
	color: ${({ theme }) => theme.colors.text.primary};
`;

const PrimaryValue = styled(InfoValue)`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ButtonRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
	padding: 4px 12px;
	border: 1px solid ${({ theme }) => theme.colors.primary};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background: #fff;
	color: ${({ theme }) => theme.colors.primary};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	cursor: pointer;
	transition: background 0.2s, color 0.2s;

	&:hover {
		background: ${({ theme }) => theme.colors.primary};
		color: #fff;
	}
`;

const DeleteButton = styled.button`
	padding: 4px 12px;
	border: 1px solid ${({ theme }) => theme.colors.semantic.error};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background: #fff;
	color: ${({ theme }) => theme.colors.semantic.error};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	cursor: pointer;
	transition: background 0.2s, color 0.2s;
	margin-left: auto;

	&:hover {
		background: ${({ theme }) => theme.colors.semantic.error};
		color: #fff;
	}
`;

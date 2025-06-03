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
	return (
		<div
			style={{
				border: "1px solid #eee",
				borderRadius: 8,
				padding: 12,
				marginBottom: 12,
				background: "#f8fafd",
			}}
		>
			<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
				주유내역
			</div>
			<div>단가: {record.unitPrice.toLocaleString()}원</div>
			<div>주유량: {record.fuelAmount.toLocaleString()}L</div>
			<div>총주유비: {record.totalFuelCost.toLocaleString()}원</div>
			<div style={{ marginTop: 8, display: "flex", gap: 8 }}>
				<button type="button" onClick={() => onEdit?.(record)}>
					수정
				</button>
				<button type="button" onClick={() => onDelete?.(record.id)}>
					삭제
				</button>
			</div>
		</div>
	);
}

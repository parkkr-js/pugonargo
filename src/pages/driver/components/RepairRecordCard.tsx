export interface RepairRecord {
	id: string;
	repairCost: number;
	memo: string;
	date: string;
	vehicleNumber: string;
}
interface RepairRecordCardProps {
	record: RepairRecord;
	onEdit?: (record: RepairRecord) => void;
	onDelete?: (id: string) => void;
}
export function RepairRecordCard({
	record,
	onEdit,
	onDelete,
}: RepairRecordCardProps) {
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
				수리내역
			</div>
			<div>정비비용: {record.repairCost.toLocaleString()}원</div>
			<div>메모: {record.memo}</div>
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

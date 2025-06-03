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
		<div
			style={{
				border: "1px solid #eee",
				borderRadius: 8,
				padding: 12,
				marginBottom: 12,
				background: "#fff",
			}}
		>
			<div>운송구간: {record.e}</div>
			<div>지급중량: {m.toLocaleString()}</div>
			<div>총 금액: {totalAmount.toLocaleString()} 원</div>
			<div>지입료(5%): {deduction.toLocaleString()} 원</div>
			<div>공제 후 금액: {o.toLocaleString()} 원</div>
		</div>
	);
}

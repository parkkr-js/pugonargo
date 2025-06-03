import { useMonthList } from "../hooks/useMonthList";

interface MonthNavigatorProps {
	monthId: string;
	setMonthId: (id: string) => void;
}

export function MonthNavigator({ monthId, setMonthId }: MonthNavigatorProps) {
	const { data: months = [], isLoading, error } = useMonthList();

	const idx = months.indexOf(monthId);
	const prev = months[idx - 1];
	const next = months[idx + 1];

	if (isLoading)
		return <div style={{ minHeight: 40 }}>월 목록 불러오는 중...</div>;
	if (error || months.length === 0)
		return (
			<div style={{ color: "#888", minHeight: 40 }}>월 데이터가 없습니다</div>
		);

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 16,
				margin: "24px 0",
			}}
		>
			<button
				type="button"
				onClick={() => prev && setMonthId(prev)}
				disabled={!prev}
				style={{ fontSize: 24, opacity: prev ? 1 : 0.3 }}
			>
				&#60;
			</button>
			<span style={{ fontSize: 28, fontWeight: 700 }}>
				{monthId.replace("-", ". ")}월
			</span>
			<button
				type="button"
				onClick={() => next && setMonthId(next)}
				disabled={!next}
				style={{ fontSize: 24, opacity: next ? 1 : 0.3 }}
			>
				&#62;
			</button>
		</div>
	);
}

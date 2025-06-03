import { useEffect, useState } from "react";
import { CostSummary } from "./components/CostSummary";
import { CostTable } from "./components/CostTable";
import { MonthNavigator } from "./components/MonthNavigator";
import { StatsCards } from "./components/StatsCards";
import { useDriversMap } from "./hooks/useDriversMap";
import { useFuelRepairTable } from "./hooks/useFuelRepairTable";
import { useMonthList } from "./hooks/useMonthList";
import { useMonthStats } from "./hooks/useMonthStats";

export default function DashboardPage() {
	const [monthId, setMonthId] = useState("");
	const { data: months = [], isLoading: monthsLoading } = useMonthList();
	const { data: driversMap, isLoading: driversLoading } = useDriversMap();
	const { data: monthStats, isLoading: statsLoading } = useMonthStats(monthId);
	const { tableRows } = useFuelRepairTable(monthId, driversMap);

	const [filteredRows, setFilteredRows] = useState(tableRows);

	// 월 목록이 로드되면 가장 최근 월을 선택
	useEffect(() => {
		if (months.length > 0 && !monthId) {
			setMonthId(months[months.length - 1]);
		}
	}, [months, monthId]);

	const isLoading = monthsLoading || driversLoading || statsLoading;

	// 필터링된 데이터의 합계 계산
	const filteredTotals = filteredRows.reduce(
		(acc, row) => {
			if (row.type === "repair") {
				acc.totalRepair += row.cost;
			} else {
				acc.totalFuel += row.cost;
			}
			acc.totalCost += row.cost;
			return acc;
		},
		{ totalRepair: 0, totalFuel: 0, totalCost: 0 },
	);

	return (
		<div style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
			<h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
				대시보드{" "}
				<span style={{ fontWeight: 400, fontSize: 16, color: "#888" }}>
					| 전체 거래 현황을 파악해보세요
				</span>
			</h2>
			<MonthNavigator monthId={monthId} setMonthId={setMonthId} />
			{isLoading ? (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: 300,
					}}
				>
					<div>로딩중...</div>
				</div>
			) : (
				<>
					<div style={{ marginBottom: 8, color: "#888", fontSize: 14 }}>
						거래 내역{" "}
						<span style={{ fontWeight: 400 }}>
							(구글 시트에서 불러오는 값입니다.)
						</span>
					</div>
					<StatsCards stats={monthStats} />
					<div style={{ margin: "32px 0 8px 0", color: "#888", fontSize: 14 }}>
						정비 · 유류비{" "}
						<span style={{ fontWeight: 400 }}>
							(기사님들이 직접 입력한 값입니다.)
						</span>
					</div>
					<CostSummary
						totalRepair={filteredTotals.totalRepair}
						totalFuel={filteredTotals.totalFuel}
						totalCost={filteredTotals.totalCost}
					/>
					<CostTable rows={tableRows} onFilteredRowsChange={setFilteredRows} />
				</>
			)}
		</div>
	);
}

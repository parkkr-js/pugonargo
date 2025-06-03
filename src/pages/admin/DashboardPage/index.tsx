import { Card, Divider, Space, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { CostSummary } from "./components/CostSummary";
import { CostTable } from "./components/CostTable";
import { MonthNavigator } from "./components/MonthNavigator";
import { StatsCards } from "./components/StatsCards";
import { useDriversMap } from "./hooks/useDriversMap";
import { useFuelRepairTable } from "./hooks/useFuelRepairTable";
import { useMonthList } from "./hooks/useMonthList";
import { useMonthStats } from "./hooks/useMonthStats";

const { Title, Text } = Typography;

export default function DashboardPage() {
	const [monthId, setMonthId] = useState("");
	const { data: months = [], isLoading: monthsLoading } = useMonthList();
	const { data: driversMap, isLoading: driversLoading } = useDriversMap();
	const { data: monthStats, isLoading: statsLoading } = useMonthStats(monthId);
	const { tableRows, isLoading: tableLoading } = useFuelRepairTable(
		monthId,
		driversMap,
	);

	const [filteredRows, setFilteredRows] = useState(tableRows);

	// 월 목록이 로드되면 가장 최근 월을 선택
	useEffect(() => {
		if (months.length > 0 && !monthId) {
			setMonthId(months[months.length - 1]);
		}
	}, [months, monthId]);

	const isLoading =
		monthsLoading || driversLoading || statsLoading || tableLoading;

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
		<AdminLayout>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<div>
					<Title level={2} style={{ marginBottom: 4 }}>
						대시보드
					</Title>
					<Text type="secondary">전체 거래 현황을 파악해보세요</Text>
				</div>

				<MonthNavigator monthId={monthId} setMonthId={setMonthId} />

				{isLoading ? (
					<div style={{ textAlign: "center", padding: "48px 0" }}>
						<Spin size="large" />
					</div>
				) : (
					<>
						<Card>
							<Space
								direction="vertical"
								size="small"
								style={{ width: "100%" }}
							>
								<Text type="secondary">
									거래 내역 (구글 시트에서 불러오는 값입니다.)
								</Text>
								<StatsCards stats={monthStats} />
							</Space>
						</Card>

						<Card>
							<Space
								direction="vertical"
								size="large"
								style={{ width: "100%" }}
							>
								<Text type="secondary">
									정비 · 유류비 (기사님들이 직접 입력한 값입니다.)
								</Text>
								<CostSummary
									totalRepair={filteredTotals.totalRepair}
									totalFuel={filteredTotals.totalFuel}
									totalCost={filteredTotals.totalCost}
								/>
								<Divider style={{ margin: "16px 0" }} />
								<CostTable
									rows={tableRows}
									onFilteredRowsChange={setFilteredRows}
								/>
							</Space>
						</Card>
					</>
				)}
			</Space>
		</AdminLayout>
	);
}

import { DashboardOutlined } from "@ant-design/icons";
import { Card, Spin } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { CostTable } from "./components/CostTable";
import { InfoPopover } from "./components/InfoPopover";
import { MonthNavigator } from "./components/MonthNavigator";
import { StatsCards } from "./components/StatsCards";
import { useDriversMap } from "./hooks/useDriversMap";

import { useMonthList } from "./hooks/useMonthList";
import { useMonthStats } from "./hooks/useMonthStats";

export default function DashboardPage() {
	const [monthId, setMonthId] = useState("");
	const { data: months = [], isLoading: monthsLoading } = useMonthList();
	const { data: driversMap, isLoading: driversLoading } = useDriversMap();
	const { data: monthStats, isLoading: statsLoading } = useMonthStats(monthId);

	// 월 목록이 로드되면 가장 최근 월을 선택
	useEffect(() => {
		if (months.length > 0 && !monthId) {
			setMonthId(months[months.length - 1]);
		}
	}, [months, monthId]);

	const isLoading = monthsLoading || driversLoading || statsLoading;

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<DashboardOutlined />
						대시보드
					</MainTitle>
					<SubTitle>전체 거래 현황을 파악해보세요</SubTitle>
				</PageHeader>

				<MonthNavigator monthId={monthId} setMonthId={setMonthId} />

				{isLoading ? (
					<CenteredBox>
						<Spin size="large" />
					</CenteredBox>
				) : (
					<>
						<Card>
							<VerticalStack gap={16}>
								<HorizontalStack>
									<LabelWithSub>
										거래 내역
										<LabelSub>(구글 시트에서 불러오는 값입니다.)</LabelSub>
									</LabelWithSub>
									<InfoPopover />
								</HorizontalStack>
								<StatsCards stats={monthStats} />
							</VerticalStack>
						</Card>

						<Card>
							<VerticalStack gap={16}>
								<HorizontalStack>
									<LabelWithSub>
										정비 · 유류비
										<LabelSub>(기사님들이 직접 입력한 값입니다.)</LabelSub>
									</LabelWithSub>
								</HorizontalStack>
								<CostTable monthId={monthId} driversMap={driversMap} />
							</VerticalStack>
						</Card>
					</>
				)}
			</VerticalStack>
		</AdminLayout>
	);
}

const CenteredBox = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
`;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 24px;
`;
const MainTitle = styled.h1`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	font-weight: 700;
	color: ${({ theme }) => theme.colors.primary};
	margin: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;
const SubTitle = styled.span`
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.gray[600]};
	font-weight: 400;
`;
const LabelWithSub = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	color: ${({ theme }) => theme.colors.gray[900]};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
`;
const LabelSub = styled.span`
	font-size: 0.92rem;
	color: ${({ theme }) => theme.colors.gray[400]};
	font-weight: 400;
	margin-left: 4px;
`;

const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => gap ?? 24}px;
	width: 100%;
`;
const HorizontalStack = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
`;

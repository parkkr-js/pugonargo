import { DatabaseOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { MonthlyStatsTable } from "./components/MonthlyStatsTable";
import { RefreshButton } from "./components/RefreshButton";
import { useMonthlyStats } from "./hooks/useMonthlyStats";

export const DataManagementPage = () => {
	const { monthlyStats, isFetching, handleDelete, handleRefresh, isDeleting } =
		useMonthlyStats();

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<DatabaseOutlined />
						데이터 관리
					</MainTitle>
					<SubTitle>
						연동된 데이터 중 월단위로 데이터 삭제가 가능합니다.
					</SubTitle>
				</PageHeader>

				<ContentSection>
					<SectionHeader>
						<SectionTitle>연동된 데이터 목록</SectionTitle>
						<RefreshButton onRefresh={handleRefresh} isLoading={isFetching} />
					</SectionHeader>

					<MonthlyStatsTable
						data={monthlyStats}
						onDelete={handleDelete}
						isDeleting={isDeleting}
						isLoading={isFetching}
					/>
				</ContentSection>
			</VerticalStack>
		</AdminLayout>
	);
};

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 24px;
`;

const MainTitle = styled.h1`
	font-size: 1.5rem;
	font-weight: 700;
	color: #1E266F;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SubTitle = styled.span`
	font-size: 1rem;
	color: #666;
	font-weight: 400;
`;

const ContentSection = styled.div`
	background: white;
	border-radius: 8px;
	padding: 24px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
	font-size: 1.125rem;
	font-weight: 600;
	color: #333;
	margin: 0;
`;

const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => (gap ? `${gap}px` : "24px")};
	width: 100%;
`;

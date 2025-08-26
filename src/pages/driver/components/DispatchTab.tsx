import { StarFilled } from "@ant-design/icons";
import { Card, DatePicker, Empty, Flex, Space, Spin, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useDriverStore } from "../../../stores/driverStore";
import type { DispatchData } from "../../../types/dispatch";
import { useDispatchData } from "../hooks/useDispatchData";
import MobileCalendarStyle from "./MobileCalendarStyle";

const { Text } = Typography;

export const DispatchTab = () => {
	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
	const { vehicleNumber, driversDbSupplier } = useDriverStore();

	const docId = selectedDate.format("YYYY-MM-DD");
	const { data: dispatchData, isLoading } = useDispatchData(docId);

	// 현재 기사의 차량번호와 매입처로 필터링
	const filteredData = useMemo(() => {
		if (!dispatchData) return [];
		return (
			dispatchData.filter(
				(item: DispatchData) =>
					item.vehicleNumber === vehicleNumber &&
					item.supplier === driversDbSupplier,
			) || []
		);
	}, [dispatchData, vehicleNumber, driversDbSupplier]);

	// 경로 요약 데이터 생성 (상차지 -> 하차지 별 회전수 합산)
	interface RouteSummaryItem {
		key: string;
		loadingLocation: string;
		unloadingLocation: string;
		rotationCount: number;
	}

	const routeSummary: RouteSummaryItem[] = useMemo(() => {
		if (filteredData.length === 0) return [];

		const summaryMap = new Map<string, RouteSummaryItem>();
		for (const item of filteredData) {
			const key = `${item.loadingLocation} -> ${item.unloadingLocation}`;
			const existing = summaryMap.get(key);
			if (existing) {
				existing.rotationCount += item.rotationCount;
				continue;
			}
			summaryMap.set(key, {
				key,
				loadingLocation: item.loadingLocation,
				unloadingLocation: item.unloadingLocation,
				rotationCount: item.rotationCount,
			});
		}

		return Array.from(summaryMap.values());
	}, [filteredData]);

	const handleDateChange = (date: unknown) => {
		if (date && typeof date === "object" && "format" in date) {
			setSelectedDate(date as Dayjs);
		}
	};

	const disabledDate = (current: Dayjs) => false;

	// 메모 텍스트 포맷팅 함수
	const formatMemoText = (text: string): string => {
		return text
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.join("\n");
	};

	if (!vehicleNumber || !driversDbSupplier) {
		return (
			<Container>
				<Empty
					description="차량번호와 매입처 정보가 없습니다."
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</Container>
		);
	}

	return (
		<Container>
			<MobileCalendarStyle />
			<StyledDatePicker
				value={selectedDate}
				onChange={handleDateChange}
				disabledDate={disabledDate}
				inputReadOnly
				allowClear={false}
				size="large"
			/>
			<ContentContainer>
				{isLoading ? (
					<LoadingContainer>
						<Spin size="large" />
						<div style={{ marginTop: 16, fontSize: "16px" }}>
							배차 정보를 불러오는 중...
						</div>
					</LoadingContainer>
				) : (
					<StyledSpace direction="vertical" size="middle">
						{/* 요약 정보 */}
						{routeSummary.length > 0 ? (
							<SummaryContainer>
								<SummaryTitle>요약</SummaryTitle>
								<SummaryList>
									{routeSummary.map((route) => (
										<SummaryItem key={route.key}>
											• {route.loadingLocation} → {route.unloadingLocation}{" "}
											<SummaryBadge>{route.rotationCount}회전</SummaryBadge>
										</SummaryItem>
									))}
								</SummaryList>
							</SummaryContainer>
						) : (
							<SummaryContainer>
								<SummaryTitle>요약</SummaryTitle>
								<SummaryEmptyText>배차 정보가 없습니다.</SummaryEmptyText>
							</SummaryContainer>
						)}

						{/* 배차 정보 */}
						<DispatchInfoCard title="배차 정보">
							{filteredData.length === 0 ? (
								<EmptyStateContainer justify="center" align="center">
									<EmptyStateText type="secondary">
										{selectedDate.format("MM월 DD일")} 배차 정보가 없습니다.
									</EmptyStateText>
								</EmptyStateContainer>
							) : (
								<RecordsSpace direction="vertical" size="small">
									{filteredData.map((item: DispatchData, index: number) => (
										<DispatchCard key={`${item.id}-${index}`}>
											<DispatchHeader>
												<DispatchType>
													<StarFilled />
													{item.dispatchType} ({item.supplier})
												</DispatchType>
												<RotationCount>{item.rotationCount}회전</RotationCount>
											</DispatchHeader>

											{item.warning && (
												<WarningText>
													<WarningLabel>⚠️ </WarningLabel>
													{item.warning}
												</WarningText>
											)}

											<LocationInfo>
												<LocationSection>
													<LocationHeader>
														<LocationTitle>상차지:</LocationTitle>
														<LocationText>{item.loadingLocation}</LocationText>
													</LocationHeader>
													{item.loadingMemo && (
														<MemoText>
															{formatMemoText(item.loadingMemo)}
														</MemoText>
													)}
												</LocationSection>

												<LocationSection>
													<LocationHeader>
														<LocationTitle>하차지:</LocationTitle>
														<LocationText>
															{item.unloadingLocation}
														</LocationText>
													</LocationHeader>
													{item.unloadingMemo && (
														<MemoText>
															{formatMemoText(item.unloadingMemo)}
														</MemoText>
													)}
												</LocationSection>
											</LocationInfo>
										</DispatchCard>
									))}
								</RecordsSpace>
							)}
						</DispatchInfoCard>
					</StyledSpace>
				)}
			</ContentContainer>
		</Container>
	);
};

const Container = styled.div`
	padding: ${({ theme }) => theme.spacing.md};
`;

const StyledDatePicker = styled(DatePicker)`
	width: 100%;
	.ant-picker-input > input {
		font-size: 16px;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 200px;
`;

const StyledCard = styled(Card)`
	border-radius: ${({ theme }) => theme.borderRadius.md};
	box-shadow: ${({ theme }) => theme.shadows.card};
	transition: box-shadow 0.3s ease;
	
	.ant-card-head {
		font-size: ${({ theme }) => theme.fontSizes.lg};
	}

	.ant-card-body {
		padding: ${({ theme }) => theme.spacing.sm};
	}

	&:hover {
		box-shadow: ${({ theme }) => theme.shadows.cardHover};
	}
`;

const SummaryContainer = styled.div`
	padding: 16px;
	background: ${({ theme }) => theme.colors.background.main};
	border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const SummaryTitle = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.text.primary};
	margin-bottom: 12px;
`;

const SummaryList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const SummaryItem = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	color: black;
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	line-height: 1.5;
`;

const SummaryEmptyText = styled.div`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	text-align: center;
	padding: 20px 0;
`;

const DispatchInfoCard = styled(StyledCard)`
  .ant-card-head {
    align-items: flex-start;
  }
`;

const EmptyStateContainer = styled(Flex)`
	min-height: 80px;
`;

const RecordsSpace = styled(Space)`
	width: 100%;
`;

const ContentContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.md};
`;

const StyledSpace = styled(Space)`
	width: 100%;
`;

const EmptyStateText = styled(Text)`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
`;

const DispatchCard = styled.div`
	border: 1px solid ${({ theme }) => theme.colors.border.light};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: 20px;
	background: ${({ theme }) => theme.colors.background.main};
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
	margin-bottom: 8px;
	
	&:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}
`;

const DispatchHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 16px;
	border-bottom: 2px solid ${({ theme }) => theme.colors.primary}20;
`;

const DispatchType = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.text.primary};
`;

const RotationCount = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.primary};
	background: ${({ theme }) => theme.colors.primary}10;
	padding: 4px 16px;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const LocationInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const LocationSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 0;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const LocationHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const LocationTitle = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: black;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const LocationText = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	color: black;	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-word;
`;

const MemoText = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.md};
	color: ${({ theme }) => theme.colors.text.secondary};
	background: ${({ theme }) => theme.colors.background.main};
	padding: 10px 12px;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
	line-height: 1.5;
	white-space: pre-wrap;
	word-break: break-word;
`;

const SummaryBadge = styled.span`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}10;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const WarningText = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: #D10003;
	background: transparent;
	line-height: 1.5; 
	white-space: pre-wrap;
	word-break: break-word;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
`;

const WarningLabel = styled.span`
`;

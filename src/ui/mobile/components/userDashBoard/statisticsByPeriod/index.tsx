// src/ui/mobile/components/userDashBoard/statisticsByPeriod/index.tsx

import {
	Alert,
	Card,
	DatePicker,
	Space,
	Spin,
	Typography,
	message,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../features/auth/application/selectors/authSelector";
import { useLazyGetStatisticsByPeriodQuery } from "../../../../../features/statisticsByPeriod/api/statisticsByPeriod.api";
import type { PeriodStatistics } from "../../../../../features/statisticsByPeriod/types/statisticsByPeriod.interface";
import { QuickPeriodButtons } from "./QuickPeriodButtons";
import { StatisticsCard } from "./StatisticsCard";

const { RangePicker } = DatePicker;
const { Text } = Typography;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const StatisticsByPeriod = () => {
	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);
	const [selectedRange, setSelectedRange] = useState<RangeValue>(null);
	const [statistics, setStatistics] = useState<PeriodStatistics | null>(null);

	const [triggerGetStatistics, { isLoading, error }] =
		useLazyGetStatisticsByPeriodQuery();

	/**
	 * 통계 데이터 로드 함수
	 * 디바운싱으로 불필요한 API 호출 방지
	 */
	const handleLoadStatistics = useCallback(
		async (startDate: string, endDate: string) => {
			if (!vehicleNumber) {
				message.error("로그인된 사용자 정보를 찾을 수 없습니다.");
				return;
			}

			try {
				const result = await triggerGetStatistics({
					vehicleNumber,
					startDate,
					endDate,
				}).unwrap();

				setStatistics(result);
			} catch (error) {
				console.error("❌ 통계 로드 실패:", error);
				message.error("통계 데이터를 불러오는데 실패했습니다.");
				setStatistics(null); // 에러 시 기존 데이터 클리어
			}
		},
		[vehicleNumber, triggerGetStatistics],
	);

	/**
	 * 컴포넌트 마운트 시 오늘 날짜로 초기화
	 */
	useEffect(() => {
		if (vehicleNumber) {
			const today = dayjs();
			setSelectedRange([today, today]);

			const todayString = today.format("YYYY-MM-DD");
			handleLoadStatistics(todayString, todayString);
		}
	}, [vehicleNumber, handleLoadStatistics]);

	/**
	 * 날짜 범위 변경 핸들러
	 * 즉시 API 호출하여 실시간 업데이트
	 */
	const handleDateChange = useCallback(
		(dates: RangeValue) => {
			setSelectedRange(dates);

			if (dates?.[0] && dates?.[1]) {
				// 기존 통계 데이터 초기화 (새로운 조회 시작)
				setStatistics(null);

				void handleLoadStatistics(
					dates[0].format("YYYY-MM-DD"),
					dates[1].format("YYYY-MM-DD"),
				);
			}
		},
		[handleLoadStatistics],
	);

	/**
	 * 빠른 선택 버튼 핸들러
	 */
	const handleQuickSelect = useCallback(
		(startDate: Dayjs, endDate: Dayjs) => {
			setSelectedRange([startDate, endDate]);
			setStatistics(null); // 기존 데이터 초기화

			void handleLoadStatistics(
				startDate.format("YYYY-MM-DD"),
				endDate.format("YYYY-MM-DD"),
			);
		},
		[handleLoadStatistics],
	);

	/**
	 * 미래 날짜 비활성화
	 */
	const disabledDate = useCallback((current: Dayjs): boolean => {
		return current && current > dayjs().endOf("day");
	}, []);

	/**
	 * 통계 데이터 포맷팅 (메모이제이션)
	 */
	const formattedStatistics = useMemo(() => {
		if (!statistics) return null;

		return {
			totalAmount: Math.round(statistics.totalAmount).toLocaleString("ko-KR"),
			managementFee: Math.round(statistics.managementFee).toLocaleString(
				"ko-KR",
			),
			deductedAmount: Math.round(statistics.deductedAmount).toLocaleString(
				"ko-KR",
			),
			totalFuelCost: Math.round(statistics.totalFuelCost).toLocaleString(
				"ko-KR",
			),
			totalRepairCost: Math.round(statistics.totalRepairCost).toLocaleString(
				"ko-KR",
			),
		};
	}, [statistics]);

	/**
	 * 기간 텍스트 포맷팅 (메모이제이션)
	 */
	const periodText = useMemo(() => {
		if (!selectedRange?.[0] || !selectedRange?.[1]) return "";

		const start = selectedRange[0].format("YY.MM.DD");
		const end = selectedRange[1].format("YY.MM.DD");

		return start === end ? start : `${start} - ${end}`;
	}, [selectedRange]);

	/**
	 * 로그인 확인
	 */
	if (!vehicleNumber) {
		return (
			<Space direction="vertical" style={{ width: "100%", padding: 16 }}>
				<Alert
					message="로그인 필요"
					description="기간별 통계를 보려면 로그인이 필요합니다."
					type="warning"
					showIcon
				/>
			</Space>
		);
	}

	/**
	 * 에러 상태
	 */
	if (error) {
		return (
			<Space direction="vertical" style={{ width: "100%", padding: 16 }}>
				<Alert
					message="데이터 조회 실패"
					description={
						typeof error === "object" && "error" in error
							? (error.error as string)
							: "알 수 없는 오류가 발생했습니다."
					}
					type="error"
					showIcon
				/>
			</Space>
		);
	}

	return (
		<>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: "100%", padding: 16 }}
			>
				{/* 날짜 선택 RangePicker */}
				<RangePicker
					value={selectedRange}
					onChange={handleDateChange}
					disabledDate={disabledDate}
					format="YYYY.MM.DD"
					placeholder={["시작일", "종료일"]}
					style={{ width: "100%" }}
					allowClear={false}
					disabled={isLoading}
				/>

				{/* 빠른 선택 버튼들 */}
				<QuickPeriodButtons
					onPeriodSelect={handleQuickSelect}
					disabled={isLoading}
				/>

				{/* 로딩 상태 */}
				{isLoading && (
					<Card>
						<Space
							direction="vertical"
							align="center"
							style={{ width: "100%", padding: "48px 0" }}
						>
							<Spin size="large" />
							<Text type="secondary">통계 데이터를 불러오는 중...</Text>
						</Space>
					</Card>
				)}

				{/* 통계 카드 */}
				{!isLoading && statistics && formattedStatistics && (
					<StatisticsCard
						period={periodText}
						statistics={formattedStatistics}
					/>
				)}

				{/* 데이터 없음 상태 */}
				{!isLoading &&
					!statistics &&
					!error &&
					selectedRange?.[0] &&
					selectedRange?.[1] && (
						<Card>
							<Space
								direction="vertical"
								align="center"
								style={{ width: "100%", padding: "48px 0" }}
							>
								<Text
									type="secondary"
									style={{ fontSize: 16, marginBottom: 8 }}
								>
									선택한 기간에 데이터가 없습니다
								</Text>
								<Text type="secondary" style={{ fontSize: 14 }}>
									다른 기간을 선택해 보세요
								</Text>
							</Space>
						</Card>
					)}
			</Space>

			{/* 모바일 세로 달력 스타일 */}
			<style>{`
				.ant-picker-dropdown .ant-picker-panels {
					display: flex !important;
					flex-direction: column !important;
				}
				
				.ant-picker-dropdown .ant-picker-panel-container {
					flex-direction: column !important;
				}
			`}</style>
		</>
	);
};

export default StatisticsByPeriod;

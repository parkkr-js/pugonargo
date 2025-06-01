import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Space, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useGetAvailableYearMonthsQuery } from "../../api/paymentSummary.api";

const { Text } = Typography;

interface YearMonthSelectorProps {
	onYearMonthChange?: (yearMonth: string) => void;
}

const YearMonthSelector = ({ onYearMonthChange }: YearMonthSelectorProps) => {
	const {
		data: availableYearMonths = [],
		isLoading,
		error,
	} = useGetAvailableYearMonthsQuery();

	const [selectedIndex, setSelectedIndex] = useState<number>(-1);

	useEffect(() => {
		if (
			availableYearMonths &&
			availableYearMonths.length > 0 &&
			selectedIndex === -1
		) {
			// 가장 최신 연월(마지막 인덱스)로 초기화
			const latestIndex = availableYearMonths.length - 1;
			setSelectedIndex(latestIndex);
			onYearMonthChange?.(availableYearMonths[latestIndex]);
		}
	}, [availableYearMonths, selectedIndex, onYearMonthChange]);

	const handlePrevious = () => {
		if (selectedIndex > 0) {
			const newIndex = selectedIndex - 1;
			setSelectedIndex(newIndex);
			onYearMonthChange?.(availableYearMonths[newIndex]);
		}
	};

	const handleNext = () => {
		if (selectedIndex < availableYearMonths.length - 1) {
			const newIndex = selectedIndex + 1;
			setSelectedIndex(newIndex);
			onYearMonthChange?.(availableYearMonths[newIndex]);
		}
	};

	if (isLoading) {
		return (
			<Space align="center">
				<Spin />
				<Text>연월 목록을 불러오는 중...</Text>
			</Space>
		);
	}

	if (error) {
		return (
			<Space>
				<Text type="danger">연월 목록을 불러오는데 실패했습니다</Text>
			</Space>
		);
	}

	if (!Array.isArray(availableYearMonths) || availableYearMonths.length === 0) {
		return (
			<Space>
				<Text type="secondary">사용 가능한 연월이 없습니다.</Text>
			</Space>
		);
	}

	const currentYearMonth = availableYearMonths[selectedIndex];
	const isPreviousDisabled = selectedIndex <= 0;
	const isNextDisabled = selectedIndex >= availableYearMonths.length - 1;

	return (
		<Space align="center" size="middle">
			<Button
				icon={<LeftOutlined />}
				onClick={handlePrevious}
				disabled={isPreviousDisabled}
				type="text"
			/>
			<Text strong style={{ minWidth: "80px", textAlign: "center" }}>
				{currentYearMonth}
			</Text>
			<Button
				icon={<RightOutlined />}
				onClick={handleNext}
				disabled={isNextDisabled}
				type="text"
			/>
		</Space>
	);
};

export default YearMonthSelector;

import { Button, Spin, Typography } from "antd";
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
	const [selectedYearMonth, setSelectedYearMonth] = useState<string | null>(
		null,
	);

	useEffect(() => {
		if (
			availableYearMonths &&
			availableYearMonths.length > 0 &&
			!selectedYearMonth
		) {
			const latest = availableYearMonths[availableYearMonths.length - 1];
			setSelectedYearMonth(latest);
			onYearMonthChange?.(latest);
		}
	}, [availableYearMonths, selectedYearMonth, onYearMonthChange]);

	const handleSelectYearMonth = (yearMonth: string) => {
		setSelectedYearMonth(yearMonth);
		onYearMonthChange?.(yearMonth);
	};

	if (isLoading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin />
				<Text style={{ marginLeft: "8px" }}>연월 목록을 불러오는 중...</Text>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Text type="danger">연월 목록을 불러오는데 실패했습니다</Text>
			</div>
		);
	}

	if (!Array.isArray(availableYearMonths) || availableYearMonths.length === 0) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Text type="secondary">사용 가능한 연월이 없습니다.</Text>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			{availableYearMonths.map((yearMonth) => (
				<Button
					key={yearMonth}
					type={selectedYearMonth === yearMonth ? "primary" : "default"}
					onClick={() => handleSelectYearMonth(yearMonth)}
					style={{
						minWidth: "100px",
						textAlign: "center",
					}}
				>
					{yearMonth}
				</Button>
			))}
		</div>
	);
};

export default YearMonthSelector;

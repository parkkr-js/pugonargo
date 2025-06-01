// src/ui/mobile/components/userDashBoard/statisticsByPeriod/QuickPeriodButtons.tsx
import { Button, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";

interface QuickPeriodButtonsProps {
	onPeriodSelect: (startDate: Dayjs, endDate: Dayjs) => void;
	disabled?: boolean;
}

export const QuickPeriodButtons = ({
	onPeriodSelect,
	disabled = false,
}: QuickPeriodButtonsProps) => {
	const today = dayjs();

	const handleTodaySelect = () => {
		onPeriodSelect(today, today);
	};

	const handleYesterdaySelect = () => {
		const yesterday = today.subtract(1, "day");
		onPeriodSelect(yesterday, yesterday);
	};

	const handleThisWeekSelect = () => {
		const startOfWeek = today.startOf("week");
		onPeriodSelect(startOfWeek, today);
	};

	const handleThisMonthSelect = () => {
		const startOfMonth = today.startOf("month");
		onPeriodSelect(startOfMonth, today);
	};

	return (
		<Space
			wrap
			style={{
				width: "100%",
				justifyContent: "center",
				gap: "8px 4px",
			}}
		>
			<Button
				size="small"
				onClick={handleTodaySelect}
				disabled={disabled}
				style={{ minWidth: 60 }}
			>
				오늘
			</Button>
			<Button
				size="small"
				onClick={handleYesterdaySelect}
				disabled={disabled}
				style={{ minWidth: 60 }}
			>
				어제
			</Button>
			<Button
				size="small"
				onClick={handleThisWeekSelect}
				disabled={disabled}
				style={{ minWidth: 60 }}
			>
				이번 주
			</Button>
			<Button
				size="small"
				onClick={handleThisMonthSelect}
				disabled={disabled}
				style={{ minWidth: 60 }}
			>
				이번 달
			</Button>
		</Space>
	);
};

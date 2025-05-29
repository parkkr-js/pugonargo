import { CalendarOutlined } from "@ant-design/icons";
import { DatePicker as AntDatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
// src/ui/mobile/components/userDashBoard/DatePicker.tsx
import { useState } from "react";
import "dayjs/locale/ko";

dayjs.locale("ko");

interface DatePickerProps {
	value?: string; // 'yyyy-mm-dd' 형식
	onChange: (date: string) => void;
	placeholder?: string;
}

export const DatePicker = ({
	value,
	onChange,
	placeholder = "날짜 선택",
}: DatePickerProps) => {
	const [open, setOpen] = useState(false);

	const handleDateChange = (date: Dayjs | null) => {
		if (date) {
			onChange(date.format("YYYY-MM-DD"));
		}
		setOpen(false);
	};

	const today = dayjs();
	const selectedDate = value ? dayjs(value) : today;

	return (
		<div className="w-full">
			<AntDatePicker
				value={selectedDate}
				onChange={handleDateChange}
				open={open}
				onOpenChange={setOpen}
				format="YY.MM.DD"
				placeholder={placeholder}
				suffixIcon={<CalendarOutlined />}
				disabledDate={(current) => current && current > today}
				style={{
					width: "120px",
					height: "40px",
					borderRadius: "8px",
					border: "1px solid #d9d9d9",
					fontSize: "14px",
				}}
				styles={{
					popup: {
						root: {
							zIndex: 1000,
						},
					},
				}}
				allowClear={false}
			/>
		</div>
	);
};

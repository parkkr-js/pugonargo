// ===================================================================
// 🔥 src/ui/mobile/components/userDashBoard/dailyRecord/DatePicker.tsx
// ===================================================================

import { CalendarOutlined } from "@ant-design/icons";
import { DatePicker as AntDatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
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
	const handleDateChange = (date: Dayjs | null) => {
		if (date) {
			onChange(date.format("YYYY-MM-DD"));
		}
	};

	const today = dayjs();
	const selectedDate = value ? dayjs(value) : today;

	return (
		<div>
			<AntDatePicker
				value={selectedDate}
				onChange={handleDateChange}
				format="YY.MM.DD"
				placeholder={placeholder}
				suffixIcon={<CalendarOutlined />}
				disabledDate={(current) => current && current > today}
				allowClear={false}
				size="large"
				panelRender={(panel) => (
					<div className="custom-picker-panel">{panel}</div>
				)}
			/>

			{/* 브랜드 컬러 적용 */}
			<style>{`
        /* Today 버튼 제거 */
        .custom-picker-panel .ant-picker-footer {
          display: none;
        }
        
        /* 선택된 날짜 하이라이트 */
        .ant-picker-cell-selected .ant-picker-cell-inner {
          background-color: #1E266F !important;
          border-color: #1E266F !important;
        }
        
        /* 오늘 날짜 테두리 */
        .ant-picker-cell-today .ant-picker-cell-inner {
           border-color: #1E266F !important;
        }
        
        /* 호버 효과 */
        .ant-picker-cell:hover .ant-picker-cell-inner {
          background-color: rgba(30, 38, 111, 0.1) !important;
        }
        
        /* 월/년 선택 버튼 */
        .ant-picker-header-super-prev-btn:hover,
        .ant-picker-header-prev-btn:hover,
        .ant-picker-header-next-btn:hover,
        .ant-picker-header-super-next-btn:hover {
          color: #1E266F !important;
        }
        
        /* 월/년 선택 드롭다운 */
        .ant-picker-header-view:hover {
          color: #1E266F !important;
        }
        
        /* 확인 버튼 (시간 선택이 있을 경우) */
        .ant-btn-primary {
          background-color: #1E266F !important;
          border-color: #1E266F !important;
        }
        
        .ant-btn-primary:hover {
          background-color: rgba(30, 38, 111, 0.8) !important;
          border-color: rgba(30, 38, 111, 0.8) !important;
        }
        
        /* 입력 필드 포커스 */
        .ant-picker:hover,
        .ant-picker.ant-picker-focused {
          border-color: #1E266F !important;
          box-shadow: 0 0 0 2px rgba(30, 38, 111, 0.1) !important;
        }
      `}</style>
		</div>
	);
};

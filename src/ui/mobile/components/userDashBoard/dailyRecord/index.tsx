// src/ui/mobile/components/userDashBoard/dailyRecord/index.tsx

import { Flex } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { DatePicker } from "./DatePicker";
import { FuelList } from "./fuelList";
import OperationLog from "./operationLog";
import { RepairList } from "./repairList";

const DailyRecord = () => {
	const [selectedDate, setSelectedDate] = useState<string>(
		dayjs().format("YYYY-MM-DD"),
	);

	return (
		<Flex vertical gap="small">
			{/* 날짜 선택 */}
			<Flex justify="start">
				<DatePicker value={selectedDate} onChange={setSelectedDate} />
			</Flex>

			{/* 운행 내역 */}
			<OperationLog date={selectedDate} />

			{/* 주유 내역 */}
			<FuelList selectedDate={selectedDate} />

			{/* 수리 내역 */}
			<RepairList selectedDate={selectedDate} />
		</Flex>
	);
};

export default DailyRecord;

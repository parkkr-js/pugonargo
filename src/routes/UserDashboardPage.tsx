// src/routes/UserDashboardPage.tsx (기사님용 모바일 페이지)
import { Typography } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useAuth } from "../features/auth/presentation/hooks/useAuth";
import { DatePicker } from "../ui/mobile/components/userDashBoard/DatePicker";
import OperationLog from "../ui/mobile/components/userDashBoard/dailyRecord/operationLog";
import { FuelList } from "../ui/mobile/components/userDashBoard/dailyRecord/repairList";

const { Title } = Typography;

export const UserDashboardPage = () => {
	const { user } = useAuth();
	const [selectedDate, setSelectedDate] = useState<string>(
		dayjs().format("YYYY-MM-DD"),
	);

	if (!user || user.userType !== "driver") {
		return null;
	}

	return (
		<div
			className="min-h-screen bg-gray-50 p-4"
			style={{ maxWidth: "498px", margin: "0 auto" }}
		>
			<div className="space-y-4">
				{/* 헤더 */}
				<div className="text-center py-4">
					<Title level={3} className="mb-0">
						푸고나르고(P&N)
					</Title>
				</div>

				{/* 탭 영역 - 추후 구현 */}
				<div className="flex border-b">
					<div
						className="flex-1 text-center py-3 text-gray-500"
						style={{ borderBottom: "2px solid #808080" }}
					>
						기간별 통계
					</div>
					<div
						className="flex-1 text-center py-3"
						style={{
							borderBottom: "2px solid #1E266F",
							color: "#1E266F",
							fontWeight: "bold",
						}}
					>
						일별 기록
					</div>
				</div>

				{/* 날짜 선택 */}
				<div className="flex justify-start">
					<DatePicker value={selectedDate} onChange={setSelectedDate} />
				</div>
				{/* 운행 내역 섹션 */}
				<div className="bg-white rounded-lg shadow p-4 mb-4">
					<OperationLog date={selectedDate} />
				</div>

				{/* 주유 내역 */}
				<FuelList selectedDate={selectedDate} />

				{/* 수리 내역 섹션 */}
			</div>
		</div>
	);
};

import { Typography, message } from "antd";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";
import { useGetOperationLogsQuery } from "../../../../../../features/operationLog/api/operationLog.api";
import type { OperationLogRequest } from "../../../../../../features/operationLog/types/operationLog.types";
import { OperationLogList } from "./OperationLogList";

interface OperationLogProps {
	date: string; // yyyy-mm-dd
}

const OperationLog = ({ date }: OperationLogProps) => {
	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);
	const request: OperationLogRequest = { date, vehicleNumber };

	const {
		data: operationLogs = [],
		isLoading,
		error,
	} = useGetOperationLogsQuery(request, {
		skip: !date || !vehicleNumber,
	});

	useEffect(() => {
		if (error) {
			const errorMessage =
				error && typeof error === "object" && "data" in error
					? (error.data as { error?: string })?.error ||
						"운행내역 조회에 실패했습니다."
					: "운행내역 조회에 실패했습니다.";

			message.error(errorMessage);
		}
	}, [error]);

	if (!date || !vehicleNumber) {
		return (
			<div style={{ padding: "20px 0", textAlign: "center" }}>
				<Typography.Text type="secondary">
					날짜와 차량번호를 선택해주세요.
				</Typography.Text>
			</div>
		);
	}

	return (
		<div style={{ padding: "0 16px" }}>
			<OperationLogList
				operationLogs={operationLogs}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
};

export default OperationLog;

// src/ui/mobile/components/userDashBoard/dailyRecord/operationLog/index.tsx
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";
import { useGetOperationLogsQuery } from "../../../../../../features/operationLog/api/operationLog.api";
import type { OperationLogRequest } from "../../../../../../features/operationLog/types/operationLog.types";
import { OperationLogContent } from "./OperationLogContent";

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

	return (
		<OperationLogContent
			operationLogs={operationLogs}
			isLoading={isLoading}
			error={error}
			hasVehicleNumber={!!vehicleNumber}
		/>
	);
};

export default OperationLog;

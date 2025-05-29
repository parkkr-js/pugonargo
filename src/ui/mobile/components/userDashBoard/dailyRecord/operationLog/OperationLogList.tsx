import { Empty, Spin, Typography } from "antd";
import type React from "react";
import type { OperationLogCalculated } from "../../../../../../features/operationLog/types/operationLog.types";
import { OperationLogCard } from "./OperationLogCard";

const { Text } = Typography;

interface OperationLogListProps {
	operationLogs: OperationLogCalculated[];
	isLoading: boolean;
	error?: unknown;
}

export const OperationLogList: React.FC<OperationLogListProps> = ({
	operationLogs,
	isLoading,
	error,
}) => {
	if (isLoading) {
		return (
			<div style={{ textAlign: "center", padding: "40px 0" }}>
				<Spin size="large" />
				<div style={{ marginTop: 16 }}>
					<Text type="secondary">운행내역을 불러오는 중...</Text>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ textAlign: "center", padding: "40px 0" }}>
				<Text type="danger">운행내역을 불러오는데 실패했습니다.</Text>
			</div>
		);
	}

	if (!operationLogs || operationLogs.length === 0) {
		return (
			<Empty
				description="아직 입력된 운행 내역이 없습니다"
				style={{ padding: "40px 0" }}
			/>
		);
	}

	return (
		<div>
			{operationLogs.map((operationLog) => (
				<OperationLogCard key={operationLog.id} operationLog={operationLog} />
			))}
		</div>
	);
};

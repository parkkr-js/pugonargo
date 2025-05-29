// src/ui/mobile/components/userDashBoard/dailyRecord/operationLog/OperationLogContent.tsx

import { Card, Flex, Spin, Typography } from "antd";
import type { OperationLogCalculated } from "../../../../../../features/operationLog/types/operationLog.types";
import { OperationLogCard } from "./OperationLogCard";

const { Text } = Typography;

interface OperationLogContentProps {
	operationLogs: OperationLogCalculated[];
	isLoading: boolean;
	error?: unknown;
	hasVehicleNumber: boolean;
}

export const OperationLogContent = ({
	operationLogs,
	isLoading,
	error,
	hasVehicleNumber,
}: OperationLogContentProps) => {
	if (!hasVehicleNumber) {
		return (
			<Flex justify="center" align="middle" style={{ padding: "32px" }}>
				<Text type="secondary">해당 기능은 기사님만 이용 가능합니다.</Text>
			</Flex>
		);
	}

	if (isLoading) {
		return (
			<Card
				styles={{
					body: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "16px",
					},
				}}
			>
				<Spin />
				<Text type="secondary">운행내역을 불러오는 중...</Text>
			</Card>
		);
	}

	if (error) {
		return (
			<Card
				styles={{
					body: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					},
				}}
			>
				<Text type="danger">운행내역을 불러오는데 실패했습니다.</Text>
			</Card>
		);
	}

	if (!operationLogs || operationLogs.length === 0) {
		return (
			<Card
				title="운행 내역"
				styles={{
					body: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					},
				}}
			>
				<Text type="secondary">아직 입력된 운행 내역이 없습니다.</Text>
			</Card>
		);
	}

	return (
		<Flex vertical gap="small">
			{operationLogs.map((operationLog) => (
				<OperationLogCard key={operationLog.id} operationLog={operationLog} />
			))}
		</Flex>
	);
};

import { Card, Col, Row, Space, Typography } from "antd";
import { selectFormattedOperationLog } from "../../../../../../features/operationLog/selectors/operationLog.selectors";
import type { OperationLogCalculated } from "../../../../../../features/operationLog/types/operationLog.types";

const { Text } = Typography;

interface OperationLogCardProps {
	operationLog: OperationLogCalculated;
}

export const OperationLogCard = ({ operationLog }: OperationLogCardProps) => {
	const formatted = selectFormattedOperationLog(operationLog);

	return (
		<Card title="운행 내역">
			{/* 운행 정보 */}
			<Space direction="vertical" style={{ width: "100%" }}>
				{/* 운송구간 */}
				<Row justify="space-between" align="middle">
					<Col>
						<Text type="secondary">운송구간</Text>
					</Col>
					<Col>
						<Text strong>{formatted.transportRoute}</Text>
					</Col>
				</Row>

				{/* 지급중량 */}
				<Row justify="space-between" align="middle">
					<Col>
						<Text type="secondary">지급중량</Text>
					</Col>
					<Col>
						<Text strong>{formatted.chargeableWeight}</Text>
					</Col>
				</Row>

				{/* 총 금액 */}
				<Row justify="space-between" align="middle">
					<Col>
						<Text type="secondary">총 금액</Text>
					</Col>
					<Col>
						<Text
							style={{
								color: "#1E266F",
							}}
						>
							{formatted.totalAmount}
						</Text>
					</Col>
				</Row>

				{/* 지입료 */}
				<Row justify="space-between" align="middle">
					<Col>
						<Text type="secondary">지입료(5%)</Text>
					</Col>
					<Col>
						<Text
							style={{
								color: "#1E266F",
							}}
						>
							{formatted.commissionFee}
						</Text>
					</Col>
				</Row>

				{/* 공제 후 금액 */}
				<Row justify="space-between" align="middle">
					<Col>
						<Text strong>공제 후 금액</Text>
					</Col>
					<Col>
						<Text
							strong
							style={{
								color: "#1E266F",
								fontWeight: 800,
							}}
						>
							{formatted.finalAmount}
						</Text>
					</Col>
				</Row>
			</Space>
		</Card>
	);
};

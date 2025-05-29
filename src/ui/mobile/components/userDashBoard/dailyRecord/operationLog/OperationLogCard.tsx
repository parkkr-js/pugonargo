import { Card, Col, Divider, Row, Typography } from "antd";
import type React from "react";
import { selectFormattedOperationLog } from "../../../../../../features/operationLog/selectors/operationLog.selectors";
import type { OperationLogCalculated } from "../../../../../../features/operationLog/types/operationLog.types";

const { Text, Title } = Typography;

interface OperationLogCardProps {
	operationLog: OperationLogCalculated;
}

export const OperationLogCard: React.FC<OperationLogCardProps> = ({
	operationLog,
}) => {
	const formatted = selectFormattedOperationLog(operationLog);

	return (
		<Card
			style={{
				marginBottom: 16,
				borderRadius: 12,
				boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
			}}
			bodyStyle={{ padding: 20 }}
		>
			<Title level={4} style={{ margin: 0, marginBottom: 16 }}>
				운행 내역
			</Title>

			<Row gutter={[0, 12]}>
				<Col span={24}>
					<Row justify="space-between" align="middle">
						<Col>
							<Text type="secondary">운송구간</Text>
						</Col>
						<Col>
							<Text strong style={{ fontSize: 16 }}>
								{formatted.transportRoute}
							</Text>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Row justify="space-between" align="middle">
						<Col>
							<Text type="secondary">지급중량</Text>
						</Col>
						<Col>
							<Text strong>{formatted.chargeableWeight}</Text>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Row justify="space-between" align="middle">
						<Col>
							<Text type="secondary">총 금액</Text>
						</Col>
						<Col>
							<Text strong style={{ fontSize: 18, color: "#1890ff" }}>
								{formatted.totalAmount}
							</Text>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Row justify="space-between" align="middle">
						<Col>
							<Text type="secondary">지입료(5%)</Text>
						</Col>
						<Col>
							<Text style={{ color: "#ff4d4f" }}>
								{formatted.commissionFee}
							</Text>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Divider style={{ margin: "12px 0" }} />
				</Col>

				<Col span={24}>
					<Row justify="space-between" align="middle">
						<Col>
							<Text strong style={{ fontSize: 16 }}>
								공제 후 금액
							</Text>
						</Col>
						<Col>
							<Text
								strong
								style={{
									fontSize: 20,
									color: "#52c41a",
									fontWeight: 600,
								}}
							>
								{formatted.finalAmount}
							</Text>
						</Col>
					</Row>
				</Col>
			</Row>
		</Card>
	);
};

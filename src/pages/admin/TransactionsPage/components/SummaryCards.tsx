import { Card, Col, Row, Statistic } from "antd";

export interface Summary {
	totalWithTax: number;
	totalWithoutTax: number;
	totalPaid: number;
	totalPaidWithoutTax: number;
}

export function SummaryCards({ summary }: { summary: Summary }) {
	return (
		<Row gutter={16} style={{ marginBottom: "24px" }}>
			<Col span={6}>
				<Card>
					<Statistic
						title="총 청구액(부가세 포함)"
						value={summary.totalWithTax.toLocaleString()}
						suffix="원"
						valueStyle={{ color: "#1890ff" }}
					/>
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic
						title="총 청구액(공급가)"
						value={summary.totalWithoutTax.toLocaleString()}
						suffix="원"
						valueStyle={{ color: "#52c41a" }}
					/>
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic
						title="총 지급금액"
						value={summary.totalPaid.toLocaleString()}
						suffix="원"
						valueStyle={{ color: "#722ed1" }}
					/>
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic
						title="총 지급액(공급가)"
						value={summary.totalPaidWithoutTax.toLocaleString()}
						suffix="원"
						valueStyle={{ color: "#fa8c16" }}
					/>
				</Card>
			</Col>
		</Row>
	);
}

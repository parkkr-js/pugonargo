import { FileTextOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import { AdminLayout } from "../../components/layout/AdminLayout";

const { Title, Paragraph } = Typography;

export const TransactionsPage = () => {
	// 임시 데이터 (실제로는 API에서 가져올 예정)
	const mockTransactions = [
		{
			key: "1",
			date: "2025/05/27",
			driver: "#1",
			vehicleNumber: "2412",
			type: "연료 수리 비용",
			amount: 420000,
			status: "완료",
		},
		{
			key: "2",
			date: "2025/05/26",
			driver: "#1",
			vehicleNumber: "2342",
			type: "타이어 어쩌구",
			amount: 512304,
			status: "완료",
		},
		{
			key: "3",
			date: "2025/05/26",
			driver: "#1",
			vehicleNumber: "1245",
			type: "1,888원",
			amount: 169923,
			status: "완료",
		},
		{
			key: "4",
			date: "2025/05/26",
			driver: "#2",
			vehicleNumber: "6246",
			type: "타이어 어쩌구",
			amount: 0,
			status: "대기중",
		},
	];

	const columns = [
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
		},
		{
			title: "그룹",
			dataIndex: "driver",
			key: "driver",
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
		},
		{
			title: "정비 내역 · 주유 단가",
			dataIndex: "type",
			key: "type",
		},
		{
			title: "총 비용",
			dataIndex: "amount",
			key: "amount",
			render: (amount: number) => (
				<span style={{ fontWeight: "bold" }}>
					{amount > 0 ? `${amount.toLocaleString()} 원` : "원"}
				</span>
			),
		},
		{
			title: "상태",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "완료" ? "green" : "orange"}>{status}</Tag>
			),
		},
	];

	return (
		<AdminLayout>
			<div>
				{/* 페이지 헤더 */}
				<div style={{ marginBottom: "24px" }}>
					<Title
						level={2}
						style={{
							margin: 0,
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<FileTextOutlined />
						거래 내역
					</Title>
					<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
						모든 거래 내역을 확인하고 관리하세요
					</Paragraph>
				</div>

				{/* 통계 카드 */}
				<Row gutter={16} style={{ marginBottom: "24px" }}>
					<Col span={6}>
						<Card>
							<Statistic
								title="총 청구액(부가세 포함)"
								value={107898725}
								precision={0}
								suffix="원"
								valueStyle={{ color: "#1890ff" }}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="총 청구액(공급가)"
								value={98089750}
								precision={0}
								suffix="원"
								valueStyle={{ color: "#52c41a" }}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="총 지급금액"
								value={94807525}
								precision={0}
								suffix="원"
								valueStyle={{ color: "#722ed1" }}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="총 지급액(공급가)"
								value={86188660}
								precision={0}
								suffix="원"
								valueStyle={{ color: "#fa8c16" }}
							/>
						</Card>
					</Col>
				</Row>

				{/* 거래 내역 테이블 */}
				<Card title="거래 내역 목록" style={{ marginBottom: "24px" }}>
					<Table
						columns={columns}
						dataSource={mockTransactions}
						pagination={{
							current: 1,
							total: 50,
							pageSize: 10,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} items`,
						}}
					/>
				</Card>
			</div>
		</AdminLayout>
	);
};

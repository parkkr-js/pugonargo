import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Space, Table, Tag, Typography } from "antd";
import { AdminLayout } from "../../components/layout/AdminLayout";

const { Title, Paragraph } = Typography;

interface Driver {
	key: string;
	id: string;
	name: string;
	vehicleNumber: string;
	group: string;
	phone: string;
	status: string;
	joinDate: string;
}

export const DriversPage = () => {
	// 임시 데이터 (실제로는 API에서 가져올 예정)
	const mockDrivers: Driver[] = [
		{
			key: "1",
			id: "driver01",
			name: "김기사",
			vehicleNumber: "2412",
			group: "#1",
			phone: "010-1234-5678",
			status: "활성",
			joinDate: "2024.01.15",
		},
		{
			key: "2",
			id: "driver02",
			name: "이기사",
			vehicleNumber: "2342",
			group: "#1",
			phone: "010-2345-6789",
			status: "활성",
			joinDate: "2024.02.20",
		},
		{
			key: "3",
			id: "driver03",
			name: "박기사",
			vehicleNumber: "1245",
			group: "#1",
			phone: "010-3456-7890",
			status: "활성",
			joinDate: "2024.03.10",
		},
		{
			key: "4",
			id: "driver04",
			name: "최기사",
			vehicleNumber: "6246",
			group: "#2",
			phone: "010-4567-8901",
			status: "휴무",
			joinDate: "2024.04.05",
		},
	];

	const columns = [
		{
			title: "기사 정보",
			key: "driver",
			render: (record: Driver) => (
				<Space>
					<Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
						{record.name.charAt(0)}
					</Avatar>
					<div>
						<div style={{ fontWeight: "bold" }}>{record.name}</div>
						<div style={{ fontSize: "12px", color: "#666" }}>
							ID: {record.id}
						</div>
					</div>
				</Space>
			),
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			render: (vehicleNumber: string) => (
				<Tag color="blue">{vehicleNumber}</Tag>
			),
		},
		{
			title: "그룹",
			dataIndex: "group",
			key: "group",
		},
		{
			title: "연락처",
			dataIndex: "phone",
			key: "phone",
		},
		{
			title: "상태",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "활성" ? "green" : "orange"}>{status}</Tag>
			),
		},
		{
			title: "가입일",
			dataIndex: "joinDate",
			key: "joinDate",
		},
		{
			title: "작업",
			key: "actions",
			render: (record: Driver) => (
				<Space size="small">
					<Button
						type="text"
						icon={<EditOutlined />}
						size="small"
						onClick={() => console.log("수정:", record.key)}
					>
						수정
					</Button>
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						size="small"
						onClick={() => console.log("삭제:", record.key)}
					>
						삭제
					</Button>
				</Space>
			),
		},
	];

	return (
		<AdminLayout>
			<div>
				{/* 페이지 헤더 */}
				<div
					style={{
						marginBottom: "24px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
					}}
				>
					<div>
						<Title
							level={2}
							style={{
								margin: 0,
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							<TeamOutlined />
							기사님 관리
						</Title>
						<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
							기사님 정보를 관리하고 차량을 배정하세요
						</Paragraph>
					</div>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => console.log("기사 추가")}
					>
						새 기사 추가
					</Button>
				</div>

				{/* 통계 요약 */}
				<div style={{ marginBottom: "24px" }}>
					<Space size="large">
						<Card size="small" style={{ minWidth: "120px" }}>
							<div style={{ textAlign: "center" }}>
								<div
									style={{
										fontSize: "24px",
										fontWeight: "bold",
										color: "#1890ff",
									}}
								>
									{mockDrivers.length}
								</div>
								<div style={{ fontSize: "14px", color: "#666" }}>전체 기사</div>
							</div>
						</Card>
						<Card size="small" style={{ minWidth: "120px" }}>
							<div style={{ textAlign: "center" }}>
								<div
									style={{
										fontSize: "24px",
										fontWeight: "bold",
										color: "#52c41a",
									}}
								>
									{mockDrivers.filter((d) => d.status === "활성").length}
								</div>
								<div style={{ fontSize: "14px", color: "#666" }}>활성 기사</div>
							</div>
						</Card>
						<Card size="small" style={{ minWidth: "120px" }}>
							<div style={{ textAlign: "center" }}>
								<div
									style={{
										fontSize: "24px",
										fontWeight: "bold",
										color: "#fa8c16",
									}}
								>
									{mockDrivers.filter((d) => d.status === "휴무").length}
								</div>
								<div style={{ fontSize: "14px", color: "#666" }}>휴무 기사</div>
							</div>
						</Card>
					</Space>
				</div>

				{/* 기사 목록 테이블 */}
				<Card title="기사 목록">
					<Table
						columns={columns}
						dataSource={mockDrivers}
						pagination={{
							current: 1,
							total: mockDrivers.length,
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

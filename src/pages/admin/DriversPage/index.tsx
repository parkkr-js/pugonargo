import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Popconfirm, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useState } from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import type { Driver } from "../../../types/driver";
import { DriverModal } from "./components/DriverModal";
import {
	useCreateDriverMutation,
	useDeleteDriverMutation,
	useDriversQuery,
	useUpdateDriverMutation,
} from "./hooks/useDriversQuery";

const { Title } = Typography;

export const DriversPage = memo(() => {
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

	const { data: drivers = [], isLoading } = useDriversQuery();
	const createDriver = useCreateDriverMutation();
	const updateDriver = useUpdateDriverMutation();
	const deleteDriver = useDeleteDriverMutation();

	// 모달 열기
	const handleOpenModal = (driver?: Driver) => {
		setSelectedDriver(driver);
		setModalOpen(true);
	};

	// 모달 닫기
	const handleCloseModal = () => {
		setSelectedDriver(undefined);
		setModalOpen(false);
	};

	// 드라이버 추가/수정
	const handleSubmit = async (
		data: Omit<Driver, "id" | "createdAt" | "updatedAt">,
	) => {
		try {
			if (selectedDriver) {
				await updateDriver.mutateAsync({ id: selectedDriver.id, data });
				message.success("정보가 수정되었습니다.");
			} else {
				await createDriver.mutateAsync(data);
				message.success("정보가 추가되었습니다.");
			}
			handleCloseModal();
		} catch (error) {
			message.error("정보 저장에 실패했습니다.");
		}
	};

	// 드라이버 삭제
	const handleDelete = async (id: string) => {
		try {
			await deleteDriver.mutateAsync(id);
			message.success("정보가 삭제되었습니다.");
		} catch (error) {
			message.error("정보 삭제에 실패했습니다.");
		}
	};

	const columns: ColumnsType<Driver> = [
		{
			title: "ID",
			dataIndex: "userId",
			key: "userId",
			sorter: (a: Driver, b: Driver) => a.userId.localeCompare(b.userId),
			filters: Array.from(new Set(drivers.map((d) => d.userId))).map((id) => ({
				text: id,
				value: id,
			})),
			onFilter: (value, record: Driver) => record.userId === value,
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			sorter: (a: Driver, b: Driver) =>
				a.vehicleNumber.localeCompare(b.vehicleNumber),
			filters: Array.from(new Set(drivers.map((d) => d.vehicleNumber))).map(
				(num) => ({
					text: num,
					value: num,
				}),
			),
			onFilter: (value, record: Driver) => record.vehicleNumber === value,
		},
		{
			title: "그룹",
			dataIndex: "group",
			key: "group",
			sorter: (a: Driver, b: Driver) => a.group.localeCompare(b.group),
			filters: Array.from(new Set(drivers.map((d) => d.group))).map(
				(group) => ({
					text: group,
					value: group,
				}),
			),
			onFilter: (value, record: Driver) => record.group === value,
		},
		{
			title: "덤프 중량(루베)",
			dataIndex: "dumpWeight",
			key: "dumpWeight",
			sorter: (a: Driver, b: Driver) => a.dumpWeight - b.dumpWeight,
			render: (weight: number) => weight.toFixed(1),
		},
		{
			title: "작업",
			key: "actions",
			render: (_: unknown, record: Driver) => (
				<div style={{ display: "flex", gap: "8px" }}>
					<Button type="primary" onClick={() => handleOpenModal(record)}>
						수정
					</Button>
					<Popconfirm
						title="삭제"
						description="정말로 이 기사를 삭제하시겠습니까?"
						onConfirm={() => handleDelete(record.id)}
						okText="삭제"
						cancelText="취소"
					>
						<Button danger>삭제</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<AdminLayout>
			<div>
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
						<UserOutlined />
						기사님 관리
					</Title>
				</div>

				<Card
					title="기사님 목록"
					extra={
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => handleOpenModal()}
						>
							기사님 추가
						</Button>
					}
				>
					<Table
						columns={columns}
						dataSource={drivers}
						rowKey="id"
						loading={isLoading}
						pagination={{
							pageSize: 10,
							showSizeChanger: true,
							showQuickJumper: true,
						}}
					/>
				</Card>

				<DriverModal
					open={modalOpen}
					onClose={handleCloseModal}
					onSubmit={handleSubmit}
					initialData={selectedDriver}
				/>
			</div>
		</AdminLayout>
	);
});

DriversPage.displayName = "DriversPage";

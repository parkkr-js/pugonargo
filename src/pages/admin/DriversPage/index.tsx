import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import type { Driver } from "../../../types/driver";
import { DriverModal } from "./components/DriverModal";
import {
	useCreateDriverMutation,
	useDeleteDriverMutation,
	useDriversQuery,
	useUpdateDriverMutation,
} from "./hooks/useDriversQuery";

export const DriversPage = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

	const { data: drivers = [], isLoading } = useDriversQuery();
	const createDriver = useCreateDriverMutation();
	const updateDriver = useUpdateDriverMutation();
	const deleteDriver = useDeleteDriverMutation();

	const handleOpenModal = useCallback((driver?: Driver) => {
		setSelectedDriver(driver);
		setModalOpen(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setSelectedDriver(undefined);
		setModalOpen(false);
	}, []);

	const handleSubmit = useCallback(
		async (data: Omit<Driver, "id" | "createdAt" | "updatedAt">) => {
			try {
				if (selectedDriver) {
					await updateDriver.mutateAsync({ id: selectedDriver.id, data });
				} else {
					await createDriver.mutateAsync(data);
				}
				handleCloseModal();
			} catch (error) {
				// 에러 처리
			}
		},
		[selectedDriver, updateDriver, createDriver, handleCloseModal],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteDriver.mutateAsync(id);
			} catch (error) {
				// 에러 처리
			}
		},
		[deleteDriver],
	);

	const columns: ColumnsType<Driver> = useMemo(
		() => [
			{
				title: "ID",
				dataIndex: "userId",
				key: "userId",
				filters: Array.from(new Set(drivers.map((d) => d.userId))).map(
					(id) => ({
						text: id,
						value: id,
					}),
				),
				filterSearch: true,
				onFilter: (value, record) =>
					record.userId.toLowerCase().includes(String(value).toLowerCase()),
			},
			{
				title: "차량번호",
				dataIndex: "vehicleNumber",
				key: "vehicleNumber",
				filters: Array.from(new Set(drivers.map((d) => d.vehicleNumber))).map(
					(num) => ({
						text: num,
						value: num,
					}),
				),
				filterSearch: true,
				onFilter: (value, record) =>
					record.vehicleNumber
						.toLowerCase()
						.includes(String(value).toLowerCase()),
			},
			{
				title: "그룹",
				dataIndex: "group",
				key: "group",
				filters: Array.from(new Set(drivers.map((d) => d.group))).map(
					(group) => ({
						text: group,
						value: group,
					}),
				),
				onFilter: (value, record) => record.group === value,
			},
			{
				title: "덤프 중량(루베)",
				dataIndex: "dumpWeight",
				key: "dumpWeight",
				sorter: (a, b) => a.dumpWeight - b.dumpWeight,
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
						<Button danger onClick={() => handleDelete(record.id)}>
							삭제
						</Button>
					</div>
				),
			},
		],
		[drivers, handleOpenModal, handleDelete],
	);

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<UserOutlined />
						기사님 관리
					</MainTitle>
					<SubTitle>기사님 계정을 추가하고 관리하세요</SubTitle>
				</PageHeader>

				<StyledCard
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
							showTotal: (total) => `${total}개`,
						}}
					/>
				</StyledCard>

				<DriverModal
					open={modalOpen}
					onClose={handleCloseModal}
					onSubmit={handleSubmit}
					initialData={selectedDriver}
				/>
			</VerticalStack>
		</AdminLayout>
	);
};

const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => gap ?? 24}px;
	width: 100%;
`;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 24px;
`;

const MainTitle = styled.h1`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	font-weight: 700;
	color: ${({ theme }) => theme.colors.primary};
	margin: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SubTitle = styled.span`
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.gray[600]};
	font-weight: 400;
`;

const StyledCard = styled(Card)`
	.ant-card-head {
		border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
	}
`;

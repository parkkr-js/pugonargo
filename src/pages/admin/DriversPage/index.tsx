import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Input,
	Popconfirm,
	Table,
	Typography,
	message,
} from "antd";
import type { InputRef } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import type { Driver } from "../../../types/driver";
import { DriverModal } from "./components/DriverModal";
import {
	useCreateDriverMutation,
	useDeleteDriverMutation,
	useDriversQuery,
	useUpdateDriverMutation,
} from "./hooks/useDriversQuery";

const { Title, Paragraph } = Typography;

export const DriversPage = memo(() => {
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

	const userIdSearchInput = useRef<InputRef>(null);
	const vehicleNumberSearchInput = useRef<InputRef>(null);

	const { data: drivers = [], isLoading } = useDriversQuery();
	const createDriver = useCreateDriverMutation();
	const updateDriver = useUpdateDriverMutation();
	const deleteDriver = useDeleteDriverMutation();

	// 이벤트 핸들러들 메모이제이션
	const handleOpenModal = useCallback((driver?: Driver) => {
		setSelectedDriver(driver);
		setModalOpen(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setSelectedDriver(undefined);
		setModalOpen(false);
	}, []);

	const handleSearch = useCallback(
		(selectedKeys: string[], confirm: () => void) => {
			confirm();
		},
		[],
	);

	const handleReset = useCallback((clearFilters?: () => void) => {
		clearFilters?.();
	}, []);

	// 드라이버 추가/수정
	const handleSubmit = useCallback(
		async (data: Omit<Driver, "id" | "createdAt" | "updatedAt">) => {
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
		},
		[selectedDriver, updateDriver, createDriver, handleCloseModal],
	);

	// 드라이버 삭제
	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteDriver.mutateAsync(id);
				message.success("정보가 삭제되었습니다.");
			} catch (error) {
				message.error("정보 삭제에 실패했습니다.");
			}
		},
		[deleteDriver],
	);

	// 필터 옵션들 메모이제이션
	const { userIdFilters, vehicleNumberFilters, groupFilters } = useMemo(() => {
		const userIdFilters = Array.from(new Set(drivers.map((d) => d.userId))).map(
			(id) => ({
				text: id,
				value: id,
			}),
		);

		const vehicleNumberFilters = Array.from(
			new Set(drivers.map((d) => d.vehicleNumber)),
		).map((num) => ({
			text: num,
			value: num,
		}));

		const groupFilters = Array.from(new Set(drivers.map((d) => d.group))).map(
			(group) => ({
				text: group,
				value: group,
			}),
		);

		return { userIdFilters, vehicleNumberFilters, groupFilters };
	}, [drivers]);

	// 컬럼 정의 메모이제이션
	const columns: ColumnsType<Driver> = useMemo(
		() => [
			{
				title: "ID",
				dataIndex: "userId",
				key: "userId",
				sorter: (a: Driver, b: Driver) => a.userId.localeCompare(b.userId),
				filters: userIdFilters,
				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={userIdSearchInput}
							placeholder="ID 검색"
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								handleSearch(selectedKeys as string[], confirm)
							}
							style={{ marginBottom: 8, display: "block" }}
						/>
						<Button
							type="primary"
							onClick={() => handleSearch(selectedKeys as string[], confirm)}
							size="small"
							style={{ width: 90, marginRight: 8 }}
						>
							검색
						</Button>
						<Button
							onClick={() => handleReset(clearFilters)}
							size="small"
							style={{ width: 90 }}
						>
							초기화
						</Button>
					</div>
				),
				filterIcon: (filtered: boolean) => (
					<span style={{ color: filtered ? "#1677ff" : undefined }}>🔍</span>
				),
				filterDropdownProps: {
					onOpenChange: (visible: boolean) => {
						if (visible) {
							setTimeout(() => userIdSearchInput.current?.select(), 100);
						}
					},
				},
				onFilter: (value, record: Driver) =>
					record.userId
						.toString()
						.toLowerCase()
						.includes((value as string).toLowerCase()),
			},
			{
				title: "차량번호",
				dataIndex: "vehicleNumber",
				key: "vehicleNumber",
				sorter: (a: Driver, b: Driver) =>
					a.vehicleNumber.localeCompare(b.vehicleNumber),
				filters: vehicleNumberFilters,
				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={vehicleNumberSearchInput}
							placeholder="차량번호 검색"
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								handleSearch(selectedKeys as string[], confirm)
							}
							style={{ marginBottom: 8, display: "block" }}
						/>
						<Button
							type="primary"
							onClick={() => handleSearch(selectedKeys as string[], confirm)}
							size="small"
							style={{ width: 90, marginRight: 8 }}
						>
							검색
						</Button>
						<Button
							onClick={() => handleReset(clearFilters)}
							size="small"
							style={{ width: 90 }}
						>
							초기화
						</Button>
					</div>
				),
				filterIcon: (filtered: boolean) => (
					<span style={{ color: filtered ? "#1677ff" : undefined }}>🔍</span>
				),
				filterDropdownProps: {
					onOpenChange: (visible: boolean) => {
						if (visible) {
							setTimeout(() => vehicleNumberSearchInput.current?.select(), 100);
						}
					},
				},
				onFilter: (value, record: Driver) =>
					record.vehicleNumber
						.toString()
						.toLowerCase()
						.includes((value as string).toLowerCase()),
			},
			{
				title: "그룹",
				dataIndex: "group",
				key: "group",
				sorter: (a: Driver, b: Driver) => a.group.localeCompare(b.group),
				filters: groupFilters,
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
		],
		[
			userIdFilters,
			vehicleNumberFilters,
			groupFilters,
			handleOpenModal,
			handleDelete,
			handleSearch,
			handleReset,
		],
	);

	// 페이지네이션 설정 메모이제이션
	const paginationConfig = useMemo(
		() => ({
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total: number) => `${total}개`,
		}),
		[],
	);

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
					<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
						기사님 계정을 추가하고 관리하세요
					</Paragraph>
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
						pagination={paginationConfig}
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

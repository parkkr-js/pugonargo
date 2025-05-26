// src/routes/ManageDriversPage.tsx
import { App, Button, Pagination, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Driver } from "../features/drivers/domain/entities/Driver";
import { useDrivers } from "../features/drivers/presentation/hooks/useDrivers";
import { AddDriverModal } from "../ui/deskTop/components/manageDrivers/AddDriverModal";
import { EditDriverModal } from "../ui/deskTop/components/manageDrivers/EditDriverModal";

export const ManageDriversPage = () => {
	const { drivers, isLoading, loadDrivers } = useDrivers();
	const { message } = App.useApp();

	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	const pageSize = 15;

	useEffect(() => {
		loadDrivers();
	}, [loadDrivers]);

	const handleManage = useCallback((driver: Driver) => {
		setSelectedDriver(driver);
		setShowEditModal(true);
	}, []);

	const handleCloseEditModal = useCallback(() => {
		setShowEditModal(false);
		setSelectedDriver(null);
	}, []);

	const handleCloseAddModal = useCallback(() => {
		setShowAddModal(false);
	}, []);

	const handleAddSuccess = useCallback(() => {
		message.success("기사님이 성공적으로 추가되었습니다.");
		loadDrivers();
	}, [loadDrivers, message]);

	const handleUpdateSuccess = useCallback(() => {
		message.success("기사님 정보가 성공적으로 수정되었습니다.");
		loadDrivers();
	}, [loadDrivers, message]);

	const handleDeleteSuccess = useCallback(() => {
		message.success("기사님이 성공적으로 삭제되었습니다.");
		loadDrivers();
	}, [loadDrivers, message]);

	const handleError = useCallback(
		(errorMessage: string) => {
			message.error(errorMessage);
		},
		[message],
	);

	const columns = useMemo(
		() => [
			{
				title: "No.",
				key: "no",
				width: 60,
				render: (_: unknown, __: unknown, index: number) =>
					(currentPage - 1) * pageSize + index + 1,
			},
			{
				title: "차량번호",
				dataIndex: "vehicleNumber",
				key: "vehicleNumber",
				width: 120,
			},
			{
				title: "덤프 중량(톤베)",
				dataIndex: "dumpWeight",
				key: "dumpWeight",
				width: 150,
				render: (value: number) => `${value}`,
			},
			{
				title: "그룹",
				dataIndex: "group",
				key: "group",
				width: 100,
				render: (value: string) => `${value}`,
			},
			{
				title: "관리",
				key: "action",
				width: 100,
				render: (_: unknown, record: Driver) => (
					<Button
						size="small"
						onClick={() => handleManage(record)}
						style={{
							backgroundColor: "rgba(153, 153, 153, 0.1)",
							borderColor: "rgba(153, 153, 153, 0.1)",
							color: "#000C78",
							width: 80,
							borderRadius: 4,
							padding: "4px 8px",
							display: "flex",
							alignItems: "center",
							gap: 4,
						}}
					>
						관리
					</Button>
				),
			},
		],
		[currentPage, handleManage],
	);

	const paginatedData = useMemo(
		() => drivers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[drivers, currentPage],
	);

	return (
		<div>
			{/* 페이지 헤더 */}
			<div style={{ marginBottom: 24 }}>
				<h2
					style={{
						margin: 0,
						fontSize: 24,
						fontWeight: "bold",
						marginBottom: 8,
					}}
				>
					기사님 관리
				</h2>
			</div>

			{/* 통계 및 추가 버튼 */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 16,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span style={{ fontSize: 16, fontWeight: "bold" }}>
						총 {drivers.length}명
					</span>
					<span style={{ fontSize: 14, color: "#666" }}>
						계정 발급, 기사별 구분을 위해 기사님 목록을 등록할 수 있습니다.
					</span>
				</div>
				<Button
					type="primary"
					onClick={() => setShowAddModal(true)}
					style={{
						backgroundColor: "rgba(153, 153, 153, 0.1)",
						borderColor: "rgba(153, 153, 153, 0.1)",
						color: "#000C78",
						display: "flex",
						alignItems: "center",
						gap: 4,
					}}
				>
					기사님 추가
				</Button>
			</div>

			{/* 테이블 */}
			<Table
				columns={columns}
				dataSource={paginatedData}
				loading={isLoading}
				pagination={false}
				rowKey="id"
				bordered
				size="middle"
				style={{
					backgroundColor: "#fff",
				}}
			/>

			{/* 페이지네이션 */}
			<div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
				<Pagination
					current={currentPage}
					total={drivers.length}
					pageSize={pageSize}
					onChange={setCurrentPage}
					showSizeChanger={false}
					simple
				/>
			</div>

			{/* 🔥 개선된 모달들 - 성공/에러 콜백 추가 */}
			<AddDriverModal
				visible={showAddModal}
				onCancel={handleCloseAddModal}
				onSuccess={handleAddSuccess}
				onError={handleError}
			/>

			<EditDriverModal
				visible={showEditModal}
				driver={selectedDriver}
				onCancel={handleCloseEditModal}
				onUpdateSuccess={handleUpdateSuccess}
				onDeleteSuccess={handleDeleteSuccess}
				onError={handleError}
			/>
		</div>
	);
};

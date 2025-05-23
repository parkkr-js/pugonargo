import { Button, Pagination, Table } from "antd";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Driver } from "../features/drivers/domain/entities/Driver";
import { useDrivers } from "../features/drivers/presentation/hooks/useDrivers";
import { AddDriverModal } from "../ui/deskTop/components/manageDrivers/AddDriverModal";
import { EditDriverModal } from "../ui/deskTop/components/manageDrivers/EditDriverModal";

export const ManageDriversPage: React.FC = () => {
	const { drivers, isLoading, loadDrivers } = useDrivers();

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
		// loadDrivers(); ← 이 줄 삭제 (자동 캐시 무효화됨)
	}, []);

	const handleCloseAddModal = useCallback(() => {
		setShowAddModal(false);
		// loadDrivers(); ← 이 줄 삭제 (자동 캐시 무효화됨)
	}, []);

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
				title: "사용자 ID",
				dataIndex: "userId",
				key: "userId",
				width: 100,
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
				render: (value: number) => `${value}톤`,
			},
			{
				title: "그룹",
				dataIndex: "groupNumber",
				key: "groupNumber",
				width: 100,
				render: (value: number) => `#${value}그룹`,
			},
			{
				title: "관리",
				key: "action",
				width: 80,
				render: (_: unknown, record: Driver) => (
					<Button
						size="small"
						onClick={() => handleManage(record)}
						style={{
							border: "1px solid #d9d9d9",
							borderRadius: 4,
							backgroundColor: "#fff",
						}}
					>
						관리
					</Button>
				),
			},
		],
		[currentPage, handleManage],
	); // 🔥 pageSize 제거 (상수이므로 불필요)

	const paginatedData = useMemo(
		() => drivers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[drivers, currentPage], // 🔥 pageSize 제거 (상수이므로 불필요)
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
				<p style={{ margin: 0, color: "#666", fontSize: 14 }}>
					기사님 계정을 추가하고 관리하세요
				</p>
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
						backgroundColor: "#1890ff",
						borderColor: "#1890ff",
						display: "flex",
						alignItems: "center",
						gap: 4,
					}}
				>
					👤 사용자 추가
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

			{/* 모달들 */}
			<AddDriverModal visible={showAddModal} onCancel={handleCloseAddModal} />

			<EditDriverModal
				visible={showEditModal}
				driver={selectedDriver}
				onCancel={handleCloseEditModal}
			/>
		</div>
	);
};

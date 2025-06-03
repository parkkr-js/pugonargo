import {
	Button,
	Card,
	DatePicker,
	Flex,
	Space,
	Spin,
	Typography,
	message,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import type { FuelRecordInput } from "../../../services/client/createFuelRecord";
import type { RepairRecordInput } from "../../../services/client/createRepairRecord";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { useDailyRecords } from "../hooks/useDailyRecords";
import {
	useCreateFuelRecordMutation,
	useDeleteFuelRecordMutation,
	useUpdateFuelRecordMutation,
} from "../hooks/useFuelRecords";
import {
	useCreateRepairRecordMutation,
	useDeleteRepairRecordMutation,
	useUpdateRepairRecordMutation,
} from "../hooks/useRepairRecords";
import { DailyDriveCard } from "./DailyDriveCard";
import { FuelRecordCard } from "./FuelRecordCard";
import type { FuelRecord } from "./FuelRecordCard";
import { FuelRecordModal } from "./FuelRecordModal";
import { RepairRecordCard } from "./RepairRecordCard";
import type { RepairRecord } from "./RepairRecordCard";
import { RepairRecordModal } from "./RepairRecordModal";

const { Text } = Typography;

export function DailyRecordsTab() {
	const [date, setDate] = useState<Dayjs>(dayjs());
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const { data, isLoading } = useDailyRecords(vehicleNumber, date.toDate());
	const driveRecords = data?.driveRecords ?? [];
	const fuelRecords = data?.fuelRecords ?? [];
	const repairRecords = data?.repairRecords ?? [];

	// 주유 모달 상태
	const [fuelModalOpen, setFuelModalOpen] = useState(false);
	const [editingFuel, setEditingFuel] = useState<FuelRecord | null>(null);
	// 수리 모달 상태
	const [repairModalOpen, setRepairModalOpen] = useState(false);
	const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);

	// 주유 CRUD
	const createFuelRecord = useCreateFuelRecordMutation(
		vehicleNumber,
		date.toDate(),
	);
	const updateFuelRecord = useUpdateFuelRecordMutation(
		vehicleNumber,
		date.toDate(),
	);
	const deleteFuelRecord = useDeleteFuelRecordMutation(
		vehicleNumber,
		date.toDate(),
	);

	// 수리 CRUD
	const createRepairRecord = useCreateRepairRecordMutation(
		vehicleNumber,
		date.toDate(),
	);
	const updateRepairRecord = useUpdateRepairRecordMutation(
		vehicleNumber,
		date.toDate(),
	);
	const deleteRepairRecord = useDeleteRepairRecordMutation(
		vehicleNumber,
		date.toDate(),
	);

	const [msg, contextHolder] = message.useMessage();

	const disabledDate = (current: Dayjs) =>
		current && current > dayjs().endOf("day");

	// 주유
	const handleAddFuel = () => {
		setEditingFuel(null);
		setFuelModalOpen(true);
	};
	const handleEditFuel = (record: FuelRecord) => {
		setEditingFuel(record);
		setFuelModalOpen(true);
	};
	const handleDeleteFuel = async (id: string) => {
		try {
			await deleteFuelRecord.mutateAsync(id);
			msg.success("주유 내역이 삭제되었습니다.");
		} catch {
			msg.error("삭제 실패");
		}
	};
	const handleSaveFuel = async (
		data: Omit<FuelRecordInput, "date" | "vehicleNumber">,
	) => {
		try {
			const payload = {
				...data,
				date: date.format("YYYY-MM-DD"),
				vehicleNumber,
				totalFuelCost: data.unitPrice * data.fuelAmount,
			};
			if (editingFuel) {
				await updateFuelRecord.mutateAsync({
					id: editingFuel.id,
					data: payload,
				});
				msg.success("주유 내역이 수정되었습니다.");
			} else {
				await createFuelRecord.mutateAsync(payload);
				msg.success("주유 내역이 추가되었습니다.");
			}
			setFuelModalOpen(false);
			setEditingFuel(null);
		} catch {
			msg.error("저장 실패");
		}
	};

	// 수리
	const handleAddRepair = () => {
		setEditingRepair(null);
		setRepairModalOpen(true);
	};
	const handleEditRepair = (record: RepairRecord) => {
		setEditingRepair(record);
		setRepairModalOpen(true);
	};
	const handleDeleteRepair = async (id: string) => {
		try {
			await deleteRepairRecord.mutateAsync(id);
			msg.success("수리 내역이 삭제되었습니다.");
		} catch {
			msg.error("삭제 실패");
		}
	};
	const handleSaveRepair = async (
		data: Omit<RepairRecordInput, "date" | "vehicleNumber">,
	) => {
		try {
			const payload = {
				...data,
				date: date.format("YYYY-MM-DD"),
				vehicleNumber,
			};
			if (editingRepair) {
				await updateRepairRecord.mutateAsync({
					id: editingRepair.id,
					data: payload,
				});
				msg.success("수리 내역이 수정되었습니다.");
			} else {
				await createRepairRecord.mutateAsync(payload);
				msg.success("수리 내역이 추가되었습니다.");
			}
			setRepairModalOpen(false);
			setEditingRepair(null);
		} catch {
			msg.error("저장 실패");
		}
	};

	return (
		<div style={{ padding: 16 }}>
			{contextHolder}
			<DatePicker
				value={date}
				onChange={(val) => val && setDate(val)}
				style={{ width: "100%" }}
				disabledDate={disabledDate}
			/>
			<div style={{ marginTop: 16 }}>
				{isLoading ? (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: 200,
						}}
					>
						<Spin />
					</div>
				) : (
					<Space direction="vertical" size="large" style={{ width: "100%" }}>
						{/* 운행 내역 */}
						<Card title="운행 내역" style={{ borderRadius: 10 }}>
							{driveRecords.length === 0 ? (
								<Flex justify="center" align="center" style={{ minHeight: 80 }}>
									<Text type="secondary">
										아직 입력된 운행 내역이 없습니다.
									</Text>
								</Flex>
							) : (
								<Space
									direction="vertical"
									size="small"
									style={{ width: "100%" }}
								>
									{driveRecords.map((record) => (
										<DailyDriveCard key={record.id} record={record} />
									))}
								</Space>
							)}
						</Card>

						{/* 주유 내역 */}
						<Card
							title="주유 내역"
							extra={
								<Button type="primary" size="small" onClick={handleAddFuel}>
									추가하기
								</Button>
							}
							style={{ borderRadius: 10 }}
						>
							{fuelRecords.length === 0 ? (
								<Flex justify="center" align="center" style={{ minHeight: 80 }}>
									<Text type="secondary">
										아직 입력된 주유 내역이 없습니다.
									</Text>
								</Flex>
							) : (
								<Space
									direction="vertical"
									size="small"
									style={{ width: "100%" }}
								>
									{fuelRecords.map((record) => (
										<FuelRecordCard
											key={record.id}
											record={record}
											onEdit={handleEditFuel}
											onDelete={handleDeleteFuel}
										/>
									))}
								</Space>
							)}
						</Card>
						<FuelRecordModal
							open={fuelModalOpen}
							initialData={editingFuel || undefined}
							onOk={handleSaveFuel}
							onCancel={() => {
								setFuelModalOpen(false);
								setEditingFuel(null);
							}}
							vehicleNumber={vehicleNumber}
							hideDateField
						/>

						{/* 수리 내역 */}
						<Card
							title="수리 내역"
							extra={
								<Button type="primary" size="small" onClick={handleAddRepair}>
									추가하기
								</Button>
							}
							style={{ borderRadius: 10 }}
						>
							{repairRecords.length === 0 ? (
								<Flex justify="center" align="center" style={{ minHeight: 80 }}>
									<Text type="secondary">
										아직 입력된 수리 내역이 없습니다.
									</Text>
								</Flex>
							) : (
								<Space
									direction="vertical"
									size="small"
									style={{ width: "100%" }}
								>
									{repairRecords.map((record) => (
										<RepairRecordCard
											key={record.id}
											record={record}
											onEdit={handleEditRepair}
											onDelete={handleDeleteRepair}
										/>
									))}
								</Space>
							)}
						</Card>
						<RepairRecordModal
							open={repairModalOpen}
							initialData={editingRepair || undefined}
							onOk={handleSaveRepair}
							onCancel={() => {
								setRepairModalOpen(false);
								setEditingRepair(null);
							}}
							vehicleNumber={vehicleNumber}
							hideDateField
						/>
					</Space>
				)}
			</div>
		</div>
	);
}

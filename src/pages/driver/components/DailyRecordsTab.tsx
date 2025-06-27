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
import styled from "styled-components";
import type { FuelRecordInput } from "../../../services/client/createFuelRecord";
import type { RepairRecordInput } from "../../../services/client/createRepairRecord";
import type { FuelRecord, RepairRecord } from "../../../types/driverRecord";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { useCurrentDriversDbSupplier } from "../hooks/useCurrentDriversDbSupplier";
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
import { FuelRecordModal } from "./FuelRecordModal";
import MobileCalendarStyle from "./MobileCalendarStyle";
import { RepairRecordCard } from "./RepairRecordCard";
import { RepairRecordModal } from "./RepairRecordModal";

const { Text } = Typography;

export function DailyRecordsTab() {
	const [date, setDate] = useState<Dayjs>(dayjs());
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const driversDbSupplier = useCurrentDriversDbSupplier();
	const { data, isLoading } = useDailyRecords(
		vehicleNumber,
		driversDbSupplier,
		date.toDate(),
	);
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
		driversDbSupplier,
		date.toDate(),
	);
	const updateFuelRecord = useUpdateFuelRecordMutation(
		vehicleNumber,
		driversDbSupplier,
		date.toDate(),
	);
	const deleteFuelRecord = useDeleteFuelRecordMutation(
		vehicleNumber,
		driversDbSupplier,
		date.toDate(),
	);

	// 수리 CRUD
	const createRepairRecord = useCreateRepairRecordMutation(
		vehicleNumber,
		driversDbSupplier,
		date.toDate(),
	);
	const updateRepairRecord = useUpdateRepairRecordMutation(
		vehicleNumber,
		driversDbSupplier,
		date.toDate(),
	);
	const deleteRepairRecord = useDeleteRepairRecordMutation(
		vehicleNumber,
		driversDbSupplier,
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
		data: Omit<FuelRecordInput, "date" | "vehicleNumber" | "driversDbSupplier">,
	) => {
		try {
			const payload = {
				...data,
				date: date.format("YYYY-MM-DD"),
				vehicleNumber,
				driversDbSupplier,
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
		data: Omit<
			RepairRecordInput,
			"date" | "vehicleNumber" | "driversDbSupplier"
		>,
	) => {
		try {
			const payload = {
				...data,
				date: date.format("YYYY-MM-DD"),
				vehicleNumber,
				driversDbSupplier,
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
		<Container>
			{contextHolder}
			<MobileCalendarStyle />
			<StyledDatePicker
				value={date}
				onChange={(date) => {
					if (date) {
						setDate(date as Dayjs);
					}
				}}
				disabledDate={disabledDate}
				inputReadOnly
				allowClear={false}
				size="large"
			/>
			<ContentContainer>
				{isLoading ? (
					<LoadingContainer>
						<Spin />
					</LoadingContainer>
				) : (
					<StyledSpace direction="vertical" size="middle">
						{/* 운행 내역 */}
						<StyledCard title="운행 내역">
							{driveRecords.length === 0 ? (
								<EmptyStateContainer justify="center" align="center">
									<EmptyStateText type="secondary">
										아직 입력된 운행 내역이 없습니다.
									</EmptyStateText>
								</EmptyStateContainer>
							) : (
								<RecordsSpace direction="vertical" size="small">
									{driveRecords.map((record) => (
										<DailyDriveCard key={record.id} record={record} />
									))}
								</RecordsSpace>
							)}
						</StyledCard>

						{/* 주유 내역 */}
						<StyledCard
							title="주유 내역"
							extra={
								<Button type="primary" size="large" onClick={handleAddFuel}>
									추가하기
								</Button>
							}
						>
							{fuelRecords.length === 0 ? (
								<EmptyStateContainer justify="center" align="center">
									<EmptyStateText type="secondary">
										아직 입력된 주유 내역이 없습니다.
									</EmptyStateText>
								</EmptyStateContainer>
							) : (
								<RecordsSpace direction="vertical" size="small">
									{fuelRecords.map((record) => (
										<FuelRecordCard
											key={record.id}
											record={record}
											onEdit={handleEditFuel}
											onDelete={handleDeleteFuel}
										/>
									))}
								</RecordsSpace>
							)}
						</StyledCard>
						<FuelRecordModal
							open={fuelModalOpen}
							initialData={
								editingFuel
									? {
											...editingFuel,
											vehicleNumber,
											driversDbSupplier,
										}
									: undefined
							}
							onOk={handleSaveFuel}
							onCancel={() => {
								setFuelModalOpen(false);
								setEditingFuel(null);
							}}
							vehicleNumber={vehicleNumber}
							driversDbSupplier={driversDbSupplier}
						/>

						{/* 수리 내역 */}
						<StyledCard
							title="수리 내역"
							extra={
								<Button type="primary" size="large" onClick={handleAddRepair}>
									추가하기
								</Button>
							}
						>
							{repairRecords.length === 0 ? (
								<EmptyStateContainer justify="center" align="center">
									<EmptyStateText type="secondary">
										아직 입력된 수리 내역이 없습니다.
									</EmptyStateText>
								</EmptyStateContainer>
							) : (
								<RecordsSpace direction="vertical" size="small">
									{repairRecords.map((record) => (
										<RepairRecordCard
											key={record.id}
											record={record}
											onEdit={handleEditRepair}
											onDelete={handleDeleteRepair}
										/>
									))}
								</RecordsSpace>
							)}
						</StyledCard>
						<RepairRecordModal
							open={repairModalOpen}
							initialData={
								editingRepair
									? {
											...editingRepair,
											vehicleNumber,
											driversDbSupplier,
										}
									: undefined
							}
							onOk={handleSaveRepair}
							onCancel={() => {
								setRepairModalOpen(false);
								setEditingRepair(null);
							}}
							vehicleNumber={vehicleNumber}
							driversDbSupplier={driversDbSupplier}
						/>
					</StyledSpace>
				)}
			</ContentContainer>
		</Container>
	);
}

const Container = styled.div`
	padding: ${({ theme }) => theme.spacing.md};
`;

const StyledDatePicker = styled(DatePicker)`
	width: 100%;
	.ant-picker-input > input {
		font-size: 16px;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 200px;
`;

const StyledCard = styled(Card)`
	border-radius: ${({ theme }) => theme.borderRadius.md};
	box-shadow: ${({ theme }) => theme.shadows.card};
	transition: box-shadow 0.3s ease;
	.ant-card-head {
		font-size: ${({ theme }) => theme.fontSizes.lg};
	}

	.ant-card-body {
		padding: ${({ theme }) => theme.spacing.sm};
	}

	&:hover {
		box-shadow: ${({ theme }) => theme.shadows.cardHover};
	}
`;

const EmptyStateContainer = styled(Flex)`
	min-height: 80px;
`;

const RecordsSpace = styled(Space)`
	width: 100%;
`;

const ContentContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.md};
`;

const StyledSpace = styled(Space)`
	width: 100%;
`;

const EmptyStateText = styled(Text)`
	font-size: ${({ theme }) => theme.fontSizes.lg};
`;

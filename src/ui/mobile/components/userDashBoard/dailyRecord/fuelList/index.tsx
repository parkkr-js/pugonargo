import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography, message } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";
import {
	useCreateFuelRecordMutation,
	useDeleteFuelRecordMutation,
	useGetFuelRecordsQuery,
	useUpdateFuelRecordMutation,
} from "../../../../../../features/fuel/api/fuel.api";
import type { Fuel } from "../../../../../../features/fuel/types/fuel.interface";
import { FuelForm } from "./FuelForm";
import { FuelRecordItem } from "./FuelRecordItem";

const { Text } = Typography;

interface FuelListProps {
	selectedDate: string;
}

export const FuelList = ({ selectedDate }: FuelListProps) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [editingRecord, setEditingRecord] = useState<Fuel | null>(null);

	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);

	const { data: fuelRecords = [] } = useGetFuelRecordsQuery(
		{ vehicleNumber, date: selectedDate },
		{ skip: !vehicleNumber || !selectedDate },
	);

	const [createFuelRecord, { isLoading: isCreating }] =
		useCreateFuelRecordMutation();
	const [updateFuelRecord, { isLoading: isUpdating }] =
		useUpdateFuelRecordMutation();
	const [deleteFuelRecord, { isLoading: isDeleting }] =
		useDeleteFuelRecordMutation();

	const handleAddNew = () => {
		setIsFormVisible(true);
		setEditingRecord(null);
	};

	const handleCancelForm = () => {
		setIsFormVisible(false);
		setEditingRecord(null);
	};

	const handleEditRecord = (record: Fuel) => {
		setEditingRecord(record);
		setIsFormVisible(true);
	};

	const handleDeleteRecord = async (recordId: string) => {
		try {
			await deleteFuelRecord({ recordId }).unwrap();
			messageApi.success("주유 내역이 삭제되었습니다.");
		} catch (error) {
			console.error("Delete failed:", error);
			messageApi.error("삭제에 실패했습니다.");
		}
	};

	const handleSaveRecord = async (fuelPrice: number, fuelAmount: number) => {
		try {
			if (editingRecord) {
				await updateFuelRecord({
					recordId: editingRecord.id,
					fuelPrice,
					fuelAmount,
				}).unwrap();

				messageApi.success("주유 내역이 수정되었습니다.");
			} else {
				await createFuelRecord({
					vehicleNumber,
					date: selectedDate,
					fuelPrice,
					fuelAmount,
				}).unwrap();

				messageApi.success("주유 내역이 추가되었습니다.");
			}

			setIsFormVisible(false);
			setEditingRecord(null);
		} catch (error: unknown) {
			console.error("Save failed:", error);

			let errorMessage = "알 수 없는 오류가 발생했습니다.";

			if (typeof error === "object" && error !== null) {
				if (
					"data" in error &&
					typeof error.data === "object" &&
					error.data !== null &&
					"message" in error.data &&
					typeof (error.data as { message: unknown }).message === "string"
				) {
					errorMessage = (error.data as { message: string }).message;
				} else if (
					"error" in error &&
					typeof (error as { error: unknown }).error === "string"
				) {
					errorMessage = (error as { error: string }).error;
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}
			}

			if (
				errorMessage.includes("validation failed") ||
				errorMessage.includes("invalid input") ||
				errorMessage.includes("Validation error")
			) {
				messageApi.error("저장에 실패했습니다: 입력 값을 확인해주세요.");
			} else {
				messageApi.error(`${errorMessage}`);
			}
		}
	};

	if (!vehicleNumber) {
		return (
			<Card title="주유 내역">
				<Space
					style={{ width: "100%", padding: "40px 0", textAlign: "center" }}
				>
					<Text type="secondary">해당 기능은 기사님만 이용 가능합니다.</Text>
				</Space>
			</Card>
		);
	}

	const hasRecords = fuelRecords.length > 0;

	return (
		<>
			{contextHolder}
			<Card title="주유 내역">
				{hasRecords ? (
					<Space
						direction="vertical"
						size="middle"
						style={{ width: "100%", marginBottom: "20px" }}
					>
						{fuelRecords.map((record) => (
							<FuelRecordItem
								key={record.id}
								record={record}
								onEdit={() => handleEditRecord(record)}
								onDelete={() => handleDeleteRecord(record.id)}
								isLoading={isDeleting}
							/>
						))}
					</Space>
				) : (
					<Space
						style={{
							width: "100%",
							textAlign: "center",
							justifyContent: "center",
							padding: "0 0 20px 0",
						}}
					>
						<Text type="secondary">아직 입력된 주유 내역이 없습니다.</Text>
					</Space>
				)}

				{isFormVisible && (
					<FuelForm
						initialData={
							editingRecord
								? {
										fuelPrice: editingRecord.fuelPrice,
										fuelAmount: editingRecord.fuelAmount,
									}
								: undefined
						}
						onSave={handleSaveRecord}
						onCancel={handleCancelForm}
						isLoading={isCreating || isUpdating}
						isEditing={!!editingRecord}
					/>
				)}

				{!isFormVisible && (
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddNew}
						block
					>
						추가하기
					</Button>
				)}
			</Card>
		</>
	);
};

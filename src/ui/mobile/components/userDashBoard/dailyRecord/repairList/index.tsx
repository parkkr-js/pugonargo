import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";
import {
	useCreateRepairRecordMutation,
	useDeleteRepairRecordMutation,
	useGetRepairRecordsQuery,
	useUpdateRepairRecordMutation,
} from "../../../../../../features/repair/api/repair.api";
import type { Repair } from "../../../../../../features/repair/types/repair.interface";
import { RepairForm } from "./RepairForm";
import { RepairRecordItem } from "./RepairRecordItem";

const { Text } = Typography;

interface RepairListProps {
	selectedDate: string;
}

export const RepairList = ({ selectedDate }: RepairListProps) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [editingRecord, setEditingRecord] = useState<Repair | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);

	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);

	const { data: repairRecords = [] } = useGetRepairRecordsQuery(
		{ vehicleNumber, date: selectedDate },
		{ skip: !vehicleNumber || !selectedDate },
	);

	useEffect(() => {
		console.log("Repair records fetched:", repairRecords);
	}, [repairRecords]);

	const [createRepairRecord, { isLoading: isCreating }] =
		useCreateRepairRecordMutation();
	const [updateRepairRecord, { isLoading: isUpdating }] =
		useUpdateRepairRecordMutation();
	const [deleteRepairRecord, { isLoading: isDeleting }] =
		useDeleteRepairRecordMutation();

	const handleAddNew = () => {
		setEditingRecord(null);
		setShowAddForm(true);
	};

	const handleCancelForm = () => {
		setEditingRecord(null);
		setShowAddForm(false);
	};

	const handleEditRecord = (record: Repair) => {
		setEditingRecord(record);
		setShowAddForm(false);
	};

	const handleDeleteRecord = async (recordId: string) => {
		try {
			await deleteRepairRecord({ recordId }).unwrap();
			messageApi.success("정비 내역이 삭제되었습니다.");
		} catch (error) {
			console.error("Delete failed:", error);
			messageApi.error("삭제에 실패했습니다.");
		}
	};

	const handleSaveRecord = async (
		repairCost: number,
		repairDescription: string,
	) => {
		try {
			if (editingRecord) {
				await updateRepairRecord({
					recordId: editingRecord.id,
					repairCost,
					repairDescription,
				}).unwrap();

				messageApi.success("정비 내역이 수정되었습니다.");
			} else {
				await createRepairRecord({
					vehicleNumber,
					date: selectedDate,
					repairCost,
					repairDescription,
				}).unwrap();

				messageApi.success("정비 내역이 추가되었습니다.");
			}

			setEditingRecord(null);
			setShowAddForm(false);
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
			<Card title="정비 내역">
				<Space
					style={{ width: "100%", padding: "40px 0", textAlign: "center" }}
				>
					<Text type="secondary">해당 기능은 기사님만 이용 가능합니다.</Text>
				</Space>
			</Card>
		);
	}

	const hasRecords = repairRecords.length > 0;

	return (
		<>
			{contextHolder}
			<Card title="정비 내역">
				{hasRecords ? (
					<Space
						direction="vertical"
						size="middle"
						style={{ width: "100%", marginBottom: "20px" }}
					>
						{repairRecords.map((record) => (
							<div key={record.id}>
								<RepairRecordItem
									record={record}
									onEdit={() => handleEditRecord(record)}
									onDelete={() => handleDeleteRecord(record.id)}
									isLoading={isDeleting}
								/>
								{editingRecord?.id === record.id && (
									<RepairForm
										initialData={{
											repairCost: editingRecord.repairCost,
											repairDescription: editingRecord.repairDescription,
										}}
										onSave={handleSaveRecord}
										onCancel={handleCancelForm}
										isLoading={isUpdating}
										isEditing={true}
									/>
								)}
							</div>
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
						<Text type="secondary">아직 입력된 정비 내역이 없습니다.</Text>
					</Space>
				)}

				{showAddForm && !editingRecord && (
					<RepairForm
						initialData={undefined}
						onSave={handleSaveRecord}
						onCancel={handleCancelForm}
						isLoading={isCreating}
						isEditing={false}
					/>
				)}

				{!showAddForm && !editingRecord && (
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

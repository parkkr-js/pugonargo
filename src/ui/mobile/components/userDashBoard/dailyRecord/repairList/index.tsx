import { PlusOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Input, Row, Typography } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";

const { Text, Title } = Typography;

interface RepairListProps {
	selectedDate: string; // 'yyyy-mm-dd' 형식
}

interface RepairFormData {
	repairCost: number;
	memo: string;
}

// 임시 수리 기록 타입 (실제 구현 시 적절한 타입으로 교체)
interface RepairRecord {
	id: string;
	repairCost: number;
	memo: string;
}

export const RepairList = ({ selectedDate }: RepairListProps) => {
	const { message } = App.useApp();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<RepairFormData>({
		repairCost: 0,
		memo: "",
	});
	const [costInput, setCostInput] = useState("");

	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);

	// 임시 데이터 (실제로는 API에서 가져올 데이터)
	const [repairRecords, setRepairRecords] = useState<RepairRecord[]>([]);
	const hasRepairRecords = repairRecords.length > 0;

	const handleCostChange = (value: string) => {
		const numericValue = Number.parseFloat(value) || 0;
		if (numericValue < 0) return;

		setCostInput(value);
		setFormData((prev) => ({ ...prev, repairCost: numericValue }));
	};

	const handleMemoChange = (value: string) => {
		setFormData((prev) => ({ ...prev, memo: value }));
	};

	const resetForm = () => {
		setFormData({ repairCost: 0, memo: "" });
		setCostInput("");
		setIsFormVisible(false);
		setIsEditing(false);
	};

	const resetFormData = () => {
		setFormData({ repairCost: 0, memo: "" });
		setCostInput("");
	};

	const handleAdd = () => {
		setIsFormVisible(true);
		setIsEditing(false);
		resetFormData();
	};

	const handleCancel = () => {
		resetForm();
	};

	const handleEdit = () => {
		if (hasRepairRecords) {
			const firstRecord = repairRecords[0];
			setFormData({
				repairCost: firstRecord.repairCost,
				memo: firstRecord.memo,
			});
			setCostInput(firstRecord.repairCost.toString());
			setIsFormVisible(true);
			setIsEditing(true);
		}
	};

	const handleSave = async () => {
		try {
			if (formData.repairCost <= 0) {
				message.error("정비 비용을 입력해주세요.");
				return;
			}

			// 임시 구현 - 실제로는 API 호출
			const newRecord: RepairRecord = {
				id: Date.now().toString(),
				repairCost: formData.repairCost,
				memo: formData.memo || "",
			};

			if (isEditing) {
				setRepairRecords([newRecord]);
				message.success("수리 내역이 수정되었습니다.");
			} else {
				setRepairRecords((prev) => [...prev, newRecord]);
				message.success("수리 내역이 저장되었습니다.");
			}

			resetForm();
		} catch (error) {
			console.error("Repair record save error:", error);
			message.error("저장에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleDelete = async () => {
		try {
			// 임시 구현 - 실제로는 API 호출
			setRepairRecords([]);
			message.success("수리 내역이 삭제되었습니다.");
		} catch (error) {
			console.error("Repair record deletion error:", error);
			message.error("삭제에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const isFormValid = formData.repairCost > 0;

	if (!vehicleNumber) {
		return (
			<Card>
				<Title level={5} style={{ fontSize: "16px", margin: "0 0 16px 0" }}>
					수리 내역
				</Title>
				<div className="text-center py-8">
					<Text type="secondary">해당 기능은 기사님만 이용 가능합니다.</Text>
				</div>
			</Card>
		);
	}

	return (
		<Card
			styles={{
				body: { padding: "20px" },
			}}
		>
			<Title level={5} style={{ fontSize: "16px", margin: "0 0 16px 0" }}>
				수리 내역
			</Title>

			{/* 기존 수리 내역 표시 */}
			{!hasRepairRecords ? (
				<div className="text-center py-6">
					<Text type="secondary" style={{ fontSize: "14px" }}>
						아직 입력된 수리 내역이 없습니다.
					</Text>
				</div>
			) : (
				<div className="space-y-3 mb-6">
					{repairRecords.map((record, index) => (
						<div key={record.id}>
							<Row
								justify="space-between"
								align="middle"
								style={{ marginBottom: "8px" }}
							>
								<Col>
									<Text type="secondary" style={{ fontSize: "14px" }}>
										정비 비용
									</Text>
								</Col>
								<Col>
									<Text style={{ fontSize: "14px" }}>
										{record.repairCost.toLocaleString()} 원
									</Text>
								</Col>
							</Row>

							<Row
								justify="space-between"
								align="middle"
								style={{ marginBottom: "8px" }}
							>
								<Col>
									<Text type="secondary" style={{ fontSize: "14px" }}>
										메모
									</Text>
								</Col>
								<Col>
									<Text style={{ fontSize: "14px" }}>{record.memo || "-"}</Text>
								</Col>
							</Row>

							<Row
								justify="space-between"
								align="middle"
								style={{
									marginBottom: index < repairRecords.length - 1 ? "16px" : "0",
								}}
							>
								<Col>
									<Text strong style={{ fontSize: "14px" }}>
										정비 비용
									</Text>
								</Col>
								<Col>
									<Text strong style={{ fontSize: "16px" }}>
										{record.repairCost.toLocaleString()} 원
									</Text>
								</Col>
							</Row>

							{index < repairRecords.length - 1 && (
								<div
									style={{
										height: "1px",
										backgroundColor: "#f0f0f0",
										margin: "12px 0",
									}}
								/>
							)}
						</div>
					))}
				</div>
			)}

			{/* 입력 폼 */}
			{isFormVisible && (
				<div
					style={{
						backgroundColor: "#f5f5f5",
						borderRadius: "8px",
						padding: "16px",
						marginBottom: "16px",
					}}
				>
					<div style={{ marginBottom: "16px" }}>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
							}}
						>
							정비 비용
						</Text>
						<Input
							type="number"
							value={costInput}
							onChange={(e) => handleCostChange(e.target.value)}
							placeholder="정비 비용을 입력하세요"
							suffix="원"
							style={{ textAlign: "right" }}
						/>
					</div>

					<div style={{ marginBottom: "16px" }}>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
							}}
						>
							메모
						</Text>
						<Input
							value={formData.memo}
							onChange={(e) => handleMemoChange(e.target.value)}
							placeholder="정비 내용을 작성해주세요"
						/>
					</div>

					<Row
						justify="space-between"
						align="middle"
						style={{ paddingTop: "12px", borderTop: "1px solid #d9d9d9" }}
					>
						<Col>
							<Text strong style={{ fontSize: "14px" }}>
								정비 비용
							</Text>
						</Col>
						<Col>
							<Text strong style={{ fontSize: "16px" }}>
								{formData.repairCost.toLocaleString()} 원
							</Text>
						</Col>
					</Row>
				</div>
			)}

			{/* 버튼 영역 */}
			<div className="space-y-3">
				{/* 추가하기/취소하기 버튼 */}
				{!hasRepairRecords && (
					<Button
						type="text"
						icon={<PlusOutlined />}
						onClick={isFormVisible ? handleCancel : handleAdd}
						className="w-full border-dashed border"
						style={{
							height: "48px",
							color: "#666",
						}}
					>
						{isFormVisible ? "취소하기" : "추가하기"}
					</Button>
				)}

				{/* 저장하기 버튼 (폼이 보일 때만) */}
				{isFormVisible && (
					<Button
						type="primary"
						onClick={handleSave}
						disabled={!isFormValid}
						className="w-full"
						style={{
							backgroundColor: "#1E266F",
							borderColor: "#1E266F",
							height: "48px",
							fontSize: "16px",
						}}
					>
						저장하기
					</Button>
				)}

				{/* 수정하기/삭제하기 버튼 (데이터가 있을 때) */}
				{hasRepairRecords && !isFormVisible && (
					<div style={{ display: "flex", gap: "8px" }}>
						<Button
							onClick={handleEdit}
							style={{
								flex: 1,
								height: "48px",
								fontSize: "16px",
								border: "1px solid #d9d9d9",
							}}
						>
							수정하기
						</Button>
						<Button
							type="primary"
							onClick={handleDelete}
							style={{
								flex: 1,
								backgroundColor: "#1E266F",
								borderColor: "#1E266F",
								height: "48px",
								fontSize: "16px",
							}}
						>
							삭제하기
						</Button>
					</div>
				)}
			</div>
		</Card>
	);
};

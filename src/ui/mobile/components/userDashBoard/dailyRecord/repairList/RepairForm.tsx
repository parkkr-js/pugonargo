import { MinusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

interface RepairFormProps {
	initialData?: {
		repairCost: number;
		repairDescription: string;
	};
	onSave: (repairCost: number, repairDescription: string) => void;
	onCancel: () => void;
	isLoading: boolean;
	isEditing: boolean;
}

export const RepairForm = ({
	initialData,
	onSave,
	onCancel,
	isLoading,
}: RepairFormProps) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [costInput, setCostInput] = useState(
		initialData?.repairCost?.toString() || "",
	);
	const [descriptionInput, setDescriptionInput] = useState(
		initialData?.repairDescription || "",
	);

	useEffect(() => {
		if (initialData) {
			setCostInput(initialData.repairCost.toString());
			setDescriptionInput(initialData.repairDescription);
		}
	}, [initialData]);

	const repairCost = Number.parseFloat(costInput) || 0;

	const isValid =
		!Number.isNaN(repairCost) &&
		repairCost >= 0 &&
		descriptionInput.trim().length > 0;

	const handleSave = () => {
		if (!isValid) {
			if (Number.isNaN(repairCost)) {
				messageApi.error("정비 비용은 숫자만 입력 가능합니다.");
				return;
			}
			if (repairCost < 0) {
				messageApi.error("정비 비용은 0 이상이어야 합니다.");
				return;
			}
			if (descriptionInput.trim().length === 0) {
				messageApi.error("정비 내용을 입력해주세요.");
				return;
			}
			return;
		}
		onSave(repairCost, descriptionInput.trim());
	};

	return (
		<>
			{contextHolder}
			<Card
				size="small"
				styles={{
					body: {
						padding: "20px",
						backgroundColor: "#f8f9fa",
					},
				}}
				style={{
					border: "1px solid #dee2e6",
					borderRadius: "8px",
					marginBottom: "16px",
				}}
			>
				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					{/* 입력 필드들 */}
					<div>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
							}}
						>
							정비 비용
						</Text>
						<Input
							type="number"
							value={costInput}
							onChange={(e) => setCostInput(e.target.value)}
							placeholder="670000"
							suffix="원"
							style={{ textAlign: "right" }}
							size="large"
						/>
					</div>

					<div>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
							}}
						>
							정비 내용
						</Text>
						<Input
							value={descriptionInput}
							onChange={(e) => setDescriptionInput(e.target.value)}
							placeholder="정비 내용을 작성해주세요"
							size="large"
						/>
					</div>

					{/* 정비 비용 */}
					<Flex
						justify="space-between"
						align="center"
						style={{
							width: "100%",
							padding: "12px 16px",
							backgroundColor: "white",
							borderRadius: "6px",
							border: "1px solid #e9ecef",
						}}
					>
						<Text style={{ fontSize: "15px", fontWeight: "500" }}>
							정비 비용
						</Text>
						<Text strong style={{ fontSize: "16px", color: "#1E266F" }}>
							{repairCost.toLocaleString()} 원
						</Text>
					</Flex>

					{/* 버튼들 */}
					<Flex justify="space-around" style={{ width: "100%" }}>
						<Button icon={<MinusOutlined />} onClick={onCancel}>
							취소하기
						</Button>

						<Button
							type="primary"
							icon={<SaveOutlined />}
							onClick={handleSave}
							loading={isLoading}
							disabled={!isValid}
							style={{
								backgroundColor: isValid ? "#1E266F" : "#808080",
								borderColor: isValid ? "#1E266F" : "#808080",
								color: "white",
							}}
						>
							저장하기
						</Button>
					</Flex>
				</Space>
			</Card>
		</>
	);
};

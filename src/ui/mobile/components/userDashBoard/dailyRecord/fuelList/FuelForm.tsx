import { MinusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, Space, Typography } from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

export interface FuelFormProps {
	initialData?: {
		fuelPrice: number;
		fuelAmount: number;
		totalFuelCost: number;
	};
	onSave: (fuelPrice: number, fuelAmount: number) => void;
	onCancel: () => void;
	isLoading: boolean;
	isEditing: boolean;
}

export const FuelForm = ({
	initialData,
	onSave,
	onCancel,
	isLoading,
}: FuelFormProps) => {
	const [priceInput, setPriceInput] = useState(
		initialData?.fuelPrice?.toString() || "",
	);
	const [amountInput, setAmountInput] = useState(
		initialData?.fuelAmount?.toString() || "",
	);

	useEffect(() => {
		if (initialData) {
			setPriceInput(initialData.fuelPrice.toString());
			setAmountInput(initialData.fuelAmount.toString());
		}
	}, [initialData]);

	const fuelPrice = Number.parseFloat(priceInput) || 0;
	const fuelAmount = Number.parseFloat(amountInput) || 0;
	const totalCost = Math.round(fuelPrice * fuelAmount);

	const isValid =
		!Number.isNaN(fuelPrice) &&
		!Number.isNaN(fuelAmount) &&
		fuelPrice >= 0 &&
		fuelAmount >= 0;

	const handleSave = () => {
		if (isValid) {
			onSave(fuelPrice, fuelAmount);
		}
	};

	return (
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
				<Flex gap="middle" style={{ width: "100%" }}>
					<div style={{ flex: 1 }}>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
							}}
						>
							단가
						</Text>
						<Input
							type="number"
							value={priceInput}
							onChange={(e) => setPriceInput(e.target.value)}
							placeholder="1888.66"
							suffix="원"
							style={{ textAlign: "right" }}
							size="large"
						/>
					</div>
					<div style={{ flex: 1 }}>
						<Text
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
							}}
						>
							주유량
						</Text>
						<Input
							type="number"
							value={amountInput}
							onChange={(e) => setAmountInput(e.target.value)}
							placeholder="50"
							suffix="ℓ"
							style={{ textAlign: "right" }}
							size="large"
						/>
					</div>
				</Flex>

				{/* 총 주유비 */}
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
					<Text style={{ fontSize: "15px", fontWeight: "500" }}>총 주유비</Text>
					<Text strong style={{ fontSize: "16px", color: "#1E266F" }}>
						{totalCost.toLocaleString()} 원
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
					>
						저장하기
					</Button>
				</Flex>
			</Space>
		</Card>
	);
};

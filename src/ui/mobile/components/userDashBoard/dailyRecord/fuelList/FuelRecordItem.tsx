// ===================================================================
// 🔥 src/ui/mobile/components/userDashBoard/dailyRecord/fuelList/FuelRecordItem.tsx
// ===================================================================

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Popconfirm, Space, Typography } from "antd";
import type { Fuel } from "../../../../../../features/fuel/types/fuel.interface";

const { Text } = Typography;

interface FuelRecordItemProps {
	record: Fuel;
	onEdit: () => void;
	onDelete: () => void;
	isLoading?: boolean;
}

export const FuelRecordItem = ({
	record,
	onEdit,
	onDelete,
	isLoading,
}: FuelRecordItemProps) => {
	return (
		<Card
			size="small"
			styles={{
				body: {
					padding: "16px",
					backgroundColor: "#fdfdfd",
				},
			}}
			style={{
				border: "1px solid #f0f0f0",
				borderRadius: "8px",
				boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
			}}
		>
			<Space direction="vertical" size="small" style={{ width: "100%" }}>
				{/* 단가 */}
				<Flex justify="space-between" align="center" style={{ width: "100%" }}>
					<Text type="secondary" style={{ fontSize: "14px" }}>
						단가
					</Text>
					<Text style={{ fontSize: "14px", fontWeight: "500" }}>
						{record.fuelPrice.toLocaleString()} 원
					</Text>
				</Flex>

				{/* 주유량 */}
				<Flex justify="space-between" align="center" style={{ width: "100%" }}>
					<Text type="secondary" style={{ fontSize: "14px" }}>
						주유량
					</Text>
					<Text style={{ fontSize: "14px", fontWeight: "500" }}>
						{record.fuelAmount} ℓ
					</Text>
				</Flex>

				{/* 총 주유비 */}
				<Flex
					justify="space-between"
					align="center"
					style={{
						width: "100%",
						paddingTop: "8px",
						borderTop: "1px solid #f0f0f0",
						marginTop: "8px",
					}}
				>
					<Text strong style={{ fontSize: "15px", color: "#333" }}>
						총 주유비
					</Text>
					<Text strong style={{ fontSize: "16px", color: "#1E266F" }}>
						{record.totalFuelCost.toLocaleString()} 원
					</Text>
				</Flex>

				{/* 액션 버튼들 */}
				<Flex
					justify="space-around"
					align="center"
					style={{
						width: "100%",
						paddingTop: "12px",
						borderTop: "1px solid #f5f5f5",
					}}
				>
					<Button icon={<EditOutlined />} onClick={onEdit} disabled={isLoading}>
						수정
					</Button>

					<Popconfirm
						title="삭제 확인"
						description="이 주유 내역을 삭제하시겠습니까?"
						onConfirm={onDelete}
						okText="삭제"
						cancelText="취소"
						okButtonProps={{ danger: true }}
					>
						<Button icon={<DeleteOutlined />} danger loading={isLoading}>
							삭제
						</Button>
					</Popconfirm>
				</Flex>
			</Space>
		</Card>
	);
};

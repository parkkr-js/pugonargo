// src/ui/mobile/components/userDashBoard/statisticsByPeriod/StatisticsCard.tsx
import { Card, Divider, Flex, Typography } from "antd";

const { Text } = Typography;

interface StatisticsCardProps {
	period: string;
	statistics: {
		totalAmount: string;
		managementFee: string;
		deductedAmount: string;
		totalFuelCost: string;
		totalRepairCost: string;
	};
}

interface StatItemProps {
	label: string;
	value: string;
	valueColor?: string;
	isHighlight?: boolean;
}

const StatItem = ({
	label,
	value,
	valueColor = "#1E266F",
	isHighlight = false,
}: StatItemProps) => (
	<Flex justify="space-between" align="center" style={{ padding: "8px 0" }}>
		<Text
			style={{
				fontSize: 16,
				color: "#666",
				fontWeight: isHighlight ? 600 : 400,
			}}
		>
			{label}
		</Text>
		<Text
			style={{
				color: valueColor,
				fontSize: isHighlight ? 20 : 18,
				fontWeight: 600,
			}}
		>
			{value}원
		</Text>
	</Flex>
);

export const StatisticsCard = ({ statistics }: StatisticsCardProps) => {
	return (
		<Card title="선택 기간 운행 매출" style={{ width: "100%" }}>
			<Flex vertical>
				{/* 총 금액 */}
				<StatItem label="총 금액" value={statistics.totalAmount} />

				{/* 지입료 */}
				<StatItem label="지입료(5%)" value={statistics.managementFee} />

				{/* 공제 후 금액 - 하이라이트 */}
				<StatItem
					label="공제 후 금액"
					value={statistics.deductedAmount}
					isHighlight
				/>

				{/* 구분선 */}
				<Divider style={{ margin: "8px 0" }} />

				{/* 총 유류비 */}
				<StatItem label="총 유류비" value={statistics.totalFuelCost} />

				{/* 총 정비비 */}
				<StatItem label="총 정비비" value={statistics.totalRepairCost} />
			</Flex>
		</Card>
	);
};

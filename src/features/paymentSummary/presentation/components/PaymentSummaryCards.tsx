import { Card, Col, Row, Skeleton, Statistic, Typography, message } from "antd";
import { useEffect } from "react";
import { useLazyGetPaymentSummaryQuery } from "../../api/paymentSummary.api";
import { selectFormattedPaymentSummary } from "../../selectors/paymentSummary.selectors";

const { Text } = Typography;

interface PaymentSummaryCardsProps {
	dateRange: string;
}

export const PaymentSummaryCards = ({
	dateRange,
}: PaymentSummaryCardsProps) => {
	const [getPaymentSummary, { data: summaryResponse, isLoading, error }] =
		useLazyGetPaymentSummaryQuery();

	useEffect(() => {
		if (dateRange) {
			getPaymentSummary(dateRange).catch((error) => {
				const errorMessage =
					error instanceof Error
						? error.message
						: "데이터 조회에 실패했습니다.";
				message.error(errorMessage);
			});
		}
	}, [dateRange, getPaymentSummary]);

	const formattedSummary = selectFormattedPaymentSummary(
		summaryResponse?.summary || null,
	);

	if (isLoading) {
		return (
			<Row gutter={[16, 16]}>
				{[1, 2, 3, 4].map((i) => (
					<Col xs={24} sm={12} md={6} key={i}>
						<Card>
							<Skeleton active />
						</Card>
					</Col>
				))}
			</Row>
		);
	}

	if (error) {
		return <Text type="danger">데이터를 불러오는데 실패했습니다.</Text>;
	}

	if (!summaryResponse) {
		return <Text type="secondary">{dateRange} 데이터를 찾을 수 없습니다.</Text>;
	}

	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 청구금액(부가세 포함)"
						value={formattedSummary.totalClaimAmountIncluding}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 청구금액(공급가)"
						value={formattedSummary.totalClaimAmountSupply}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 지급금액(부가세 포함)"
						value={formattedSummary.totalPaymentAmount}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 지급금액(공급가)"
						value={formattedSummary.totalPaymentAmountSupply}
					/>
				</Card>
			</Col>
		</Row>
	);
};

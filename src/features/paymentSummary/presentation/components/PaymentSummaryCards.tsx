// src/features/paymentSummary/presentation/components/PaymentSummaryCards.tsx
import { Card, Col, Row, Skeleton, Statistic, Typography, message } from "antd";
import { useEffect } from "react";
import { useLazyGetPaymentSummaryQuery } from "../../api/paymentSummary.api";
import { selectFormattedPaymentSummary } from "../../selectors/paymentSummary.selectors";

const { Text } = Typography;

interface PaymentSummaryCardsProps {
	dateRange: string; // yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd 형식 지원
}

/**
 * 지급 요약 카드 컴포넌트
 *
 * 지원하는 dateRange 형식:
 * - yyyy-mm: 해당 월의 모든 데이터 (이월 데이터 포함)
 * - yyyy-mm-dd ~ yyyy-mm-dd: 특정 날짜 범위의 데이터
 *
 * 데이터 흐름: 컴포넌트 → RTK → UseCase → Service
 * year, month, day 개별 필드로 정확한 날짜 필터링 수행
 */
export const PaymentSummaryCards = ({
	dateRange,
}: PaymentSummaryCardsProps) => {
	/**
	 * RTK Query Lazy Hook 사용
	 * dateRange 변경 시 수동으로 데이터 조회 트리거
	 */
	const [getPaymentSummary, { data: summaryResponse, isLoading, error }] =
		useLazyGetPaymentSummaryQuery();

	/**
	 * dateRange 변경 감지하여 데이터 조회 실행
	 * yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd 형식 모두 지원
	 */
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

	/**
	 * 요약 데이터를 한국어 통화 형식으로 포맷팅
	 * 계산 방식은 기존과 동일:
	 * - 총 청구금액(공급가): columnIAmount 합계
	 * - 총 지급금액(공급가): columnOAmount 합계
	 * - 부가세 포함 금액: 공급가 * 1.1
	 */
	const formattedSummary = selectFormattedPaymentSummary(
		summaryResponse?.summary || null,
	);

	/**
	 * 로딩 중일 때 스켈레톤 UI 표시
	 */
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

	/**
	 * 에러 발생 시 에러 메시지 표시
	 */
	if (error) {
		return <Text type="danger">데이터를 불러오는데 실패했습니다.</Text>;
	}

	/**
	 * 데이터가 없는 경우 안내 메시지 표시
	 */
	if (!summaryResponse) {
		return <Text type="secondary">{dateRange} 데이터를 찾을 수 없습니다.</Text>;
	}

	/**
	 * 지급 요약 카드들 렌더링
	 * 4개의 주요 지표를 반응형 그리드로 표시
	 */
	return (
		<Row gutter={[16, 16]}>
			{/* 총 청구금액(부가세 포함) */}
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 청구금액(부가세 포함)"
						value={formattedSummary.totalClaimAmountIncluding}
					/>
				</Card>
			</Col>

			{/* 총 청구금액(공급가) */}
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 청구금액(공급가)"
						value={formattedSummary.totalClaimAmountSupply}
					/>
				</Card>
			</Col>

			{/* 총 지급금액(부가세 포함) */}
			<Col xs={24} sm={12} md={6}>
				<Card>
					<Statistic
						title="총 지급금액(부가세 포함)"
						value={formattedSummary.totalPaymentAmount}
					/>
				</Card>
			</Col>

			{/* 총 지급금액(공급가) */}
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

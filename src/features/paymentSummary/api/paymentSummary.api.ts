// src/features/paymentSummary/api/paymentSummary.api.ts
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	PaymentSummaryRequest,
	PaymentSummaryResponse,
} from "../types/paymentSummary";
import { PaymentSummaryUseCases } from "../usecases/paymentSummaryUseCases";

/**
 * API 에러를 RTK Query 표준 형식으로 변환하는 헬퍼 함수
 */
const handleApiError = (
	error: unknown,
	fallbackMessage: string,
): FetchBaseQueryError => {
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;
	return {
		status: "CUSTOM_ERROR",
		error: errorMessage,
		data: { error: errorMessage },
	};
};

/**
 * 지급 요약 관련 API 엔드포인트 정의
 * 단방향 데이터 흐름: RTK → UseCase → Service
 * RTK에서 Service를 직접 호출하지 않고 반드시 UseCase를 통해 접근
 */
export const paymentSummaryApi = createApi({
	reducerPath: "paymentSummaryApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/" }),
	tagTypes: ["PaymentSummary", "AvailableYearMonths"],
	endpoints: (builder) => ({
		/**
		 * 지급 요약 데이터 조회
		 * - yyyy-mm 형식: 해당 월의 모든 데이터 (이월 데이터 포함, year/month 필드로 정확한 필터링)
		 * - yyyy-mm-dd ~ yyyy-mm-dd 형식: 특정 날짜 범위의 데이터 (year/month/day 필드로 정확한 필터링)
		 *
		 * 데이터 흐름: RTK → PaymentSummaryUseCases.calculatePaymentSummary()
		 */
		getPaymentSummary: builder.query<PaymentSummaryResponse, string>({
			queryFn: async (dateRange: string) => {
				try {
					// 단방향 흐름: RTK → UseCase (Service 직접 호출 금지)
					const paymentSummaryUseCases = new PaymentSummaryUseCases();
					const request: PaymentSummaryRequest = { dateRange };
					const result =
						await paymentSummaryUseCases.calculatePaymentSummary(request);
					return { data: result };
				} catch (error) {
					return {
						error: handleApiError(
							error,
							"지급 요약을 불러오는데 실패했습니다.",
						),
					};
				}
			},
			// 캐시 태그 설정: 동일한 dateRange로 요청 시 캐시된 결과 사용
			providesTags: (result, error, dateRange) => [
				{ type: "PaymentSummary", id: dateRange },
			],
		}),

		/**
		 * 특정 연월의 컬렉션 존재 여부 확인
		 *
		 * 데이터 흐름: RTK → PaymentSummaryUseCases.checkCollectionExists()
		 */
		checkCollectionExists: builder.query<boolean, string>({
			queryFn: async (yearMonth: string) => {
				try {
					// 단방향 흐름: RTK → UseCase (Service 직접 호출 금지)
					const paymentSummaryUseCases = new PaymentSummaryUseCases();
					const exists =
						await paymentSummaryUseCases.checkCollectionExists(yearMonth);
					return { data: exists };
				} catch (error) {
					return {
						error: handleApiError(error, "컬렉션 확인에 실패했습니다."),
					};
				}
			},
			// 캐시 태그 설정: 컬렉션별로 독립적인 캐시 관리
			providesTags: (result, error, yearMonth) => [
				{ type: "PaymentSummary", id: `collection-${yearMonth}` },
			],
		}),

		/**
		 * 사용 가능한 모든 연월 목록 조회
		 *
		 * 데이터 흐름: RTK → PaymentSummaryUseCases.getAvailableYearMonths()
		 */
		getAvailableYearMonths: builder.query<string[], void>({
			queryFn: async () => {
				try {
					// 단방향 흐름: RTK → UseCase (Service 직접 호출 금지)
					const paymentSummaryUseCases = new PaymentSummaryUseCases();
					const yearMonths =
						await paymentSummaryUseCases.getAvailableYearMonths();
					return { data: yearMonths };
				} catch (error) {
					return {
						error: handleApiError(
							error,
							"사용 가능한 연월을 불러오는데 실패했습니다.",
						),
					};
				}
			},
			// 연월 목록은 자주 변경되지 않으므로 전역 캐시 태그 사용
			providesTags: ["AvailableYearMonths"],
		}),
	}),
});

/**
 * RTK Query에서 자동 생성된 훅들 내보내기
 * - useGetPaymentSummaryQuery: 컴포넌트 마운트 시 자동 실행
 * - useLazyGetPaymentSummaryQuery: 수동으로 트리거하는 경우 사용
 * - useCheckCollectionExistsQuery: 컬렉션 존재 여부 확인
 * - useGetAvailableYearMonthsQuery: 사용 가능한 연월 목록 조회
 */
export const {
	useGetPaymentSummaryQuery,
	useLazyGetPaymentSummaryQuery,
	useCheckCollectionExistsQuery,
	useGetAvailableYearMonthsQuery,
} = paymentSummaryApi;

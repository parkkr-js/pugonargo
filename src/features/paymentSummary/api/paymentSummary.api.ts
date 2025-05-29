import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaymentSummaryService } from "../services/paymentSummaryService";
import type {
	PaymentSummaryRequest,
	PaymentSummaryResponse,
} from "../types/paymentSummary";
import { PaymentSummaryUseCases } from "../usecases/paymentSummaryUseCases";

const paymentSummaryService = new PaymentSummaryService();
const paymentSummaryUseCases = new PaymentSummaryUseCases(
	paymentSummaryService,
);

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

export const paymentSummaryApi = createApi({
	reducerPath: "paymentSummaryApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/" }),
	tagTypes: ["PaymentSummary", "AvailableYearMonths"],
	endpoints: (builder) => ({
		getPaymentSummary: builder.query<PaymentSummaryResponse, string>({
			queryFn: async (dateRange: string) => {
				try {
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
			providesTags: (result, error, dateRange) => [
				{ type: "PaymentSummary", id: dateRange },
			],
		}),

		checkCollectionExists: builder.query<boolean, string>({
			queryFn: async (yearMonth: string) => {
				try {
					const exists =
						await paymentSummaryUseCases.checkCollectionExists(yearMonth);
					return { data: exists };
				} catch (error) {
					return {
						error: handleApiError(error, "컬렉션 확인에 실패했습니다."),
					};
				}
			},
			providesTags: (result, error, yearMonth) => [
				{ type: "PaymentSummary", id: `collection-${yearMonth}` },
			],
		}),

		getAvailableYearMonths: builder.query<string[], void>({
			queryFn: async () => {
				try {
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
			providesTags: ["AvailableYearMonths"],
		}),
	}),
});

export const {
	useGetPaymentSummaryQuery,
	useLazyGetPaymentSummaryQuery,
	useCheckCollectionExistsQuery,
	useGetAvailableYearMonthsQuery,
} = paymentSummaryApi;

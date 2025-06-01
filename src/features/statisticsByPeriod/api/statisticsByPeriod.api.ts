// src/features/statisticsByPeriod/api/statisticsByPeriod.api.ts

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	GetStatisticsParams,
	PeriodStatistics,
} from "../types/statisticsByPeriod.interface";
import { statisticsByPeriodUsecases } from "../usecases/statisticsByPeriodUsecases";

export const statisticsByPeriodApi = createApi({
	reducerPath: "statisticsByPeriodApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Statistics"],
	endpoints: (builder) => ({
		/**
		 * 기간별 통계 데이터 조회
		 * @param params GetStatisticsParams 조회 파라미터
		 * @returns PeriodStatistics 통계 데이터
		 */
		getStatisticsByPeriod: builder.query<PeriodStatistics, GetStatisticsParams>(
			{
				queryFn: async ({ vehicleNumber, startDate, endDate }) => {
					try {
						// Usecase 레이어를 통한 비즈니스 로직 처리
						const statistics =
							await statisticsByPeriodUsecases.getStatisticsByPeriod(
								vehicleNumber,
								startDate,
								endDate,
							);
						return { data: statistics };
					} catch (error) {
						// 에러 처리
						const errorMessage =
							error instanceof Error
								? error.message
								: "통계 조회 중 오류가 발생했습니다.";
						return {
							error: {
								status: "FETCH_ERROR",
								error: errorMessage,
							},
						};
					}
				},
				providesTags: ["Statistics"],
			},
		),
	}),
});

export const {
	useGetStatisticsByPeriodQuery,
	useLazyGetStatisticsByPeriodQuery,
} = statisticsByPeriodApi;

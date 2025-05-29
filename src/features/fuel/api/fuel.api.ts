// src/features/fuel/api/fuel.api.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Fuel } from "../types/fuel.interface";
import {
	type CreateFuelRecordParams,
	type DeleteFuelRecordsParams,
	FuelUsecase,
	type GetFuelRecordsParams,
} from "../usecases/fuelUsecase";

const fuelUsecase = new FuelUsecase();

export const fuelApi = createApi({
	reducerPath: "fuelApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Fuel"],
	endpoints: (builder) => ({
		// 연료 기록 조회
		getFuelRecords: builder.query<Fuel[], GetFuelRecordsParams>({
			queryFn: async (params) => {
				try {
					const records = await fuelUsecase.getFuelRecords(params);
					return { data: records };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "연료 기록 조회 실패",
						},
					};
				}
			},
			providesTags: (result, error, params) => [
				{ type: "Fuel", id: `${params.vehicleNumber}-${params.date}` },
				// 🎯 개별 연료 기록에도 태그 추가 (세밀한 캐시 관리)
				...(result?.map((record) => ({
					type: "Fuel" as const,
					id: record.id,
				})) || []),
			],
		}),

		// 연료 기록 생성
		createFuelRecord: builder.mutation<Fuel, CreateFuelRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await fuelUsecase.createFuelRecord(params);
					return { data: record };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "연료 기록 생성 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Fuel", id: `${params.vehicleNumber}-${params.date}` },
				// 🎯 생성된 기록의 개별 태그도 무효화
				...(result ? [{ type: "Fuel" as const, id: result.id }] : []),
			],
			// 🎯 낙관적 업데이트 추가 (선택사항 - 더 빠른 UI 반응)
			onQueryStarted: async (params, { dispatch, queryFulfilled }) => {
				try {
					const { data: newRecord } = await queryFulfilled;

					// 기존 쿼리 결과에 새 레코드 추가
					dispatch(
						fuelApi.util.updateQueryData(
							"getFuelRecords",
							{ vehicleNumber: params.vehicleNumber, date: params.date },
							(draft) => {
								draft.unshift(newRecord); // 맨 앞에 추가 (최신순)
							},
						),
					);
				} catch {
					// 실패 시 자동으로 invalidatesTags가 처리
				}
			},
		}),

		// 연료 기록 삭제 (해당 날짜의 모든 기록)
		deleteFuelRecords: builder.mutation<void, DeleteFuelRecordsParams>({
			queryFn: async (params) => {
				try {
					await fuelUsecase.deleteFuelRecords(params);
					return { data: undefined };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "연료 기록 삭제 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Fuel", id: `${params.vehicleNumber}-${params.date}` },
				// 🎯 모든 Fuel 태그 무효화 (삭제 시에는 안전하게)
				{ type: "Fuel", id: "LIST" },
			],
			// 🎯 낙관적 업데이트 추가 (선택사항)
			onQueryStarted: async (params, { dispatch, queryFulfilled }) => {
				// 삭제 전 UI에서 미리 제거
				const patchResult = dispatch(
					fuelApi.util.updateQueryData(
						"getFuelRecords",
						{ vehicleNumber: params.vehicleNumber, date: params.date },
						(draft) => {
							// 모든 기록 제거
							draft.length = 0;
						},
					),
				);

				try {
					await queryFulfilled;
				} catch {
					// 실패 시 되돌리기
					patchResult.undo();
				}
			},
		}),
	}),
});

export const {
	useGetFuelRecordsQuery,
	useCreateFuelRecordMutation,
	useDeleteFuelRecordsMutation,
} = fuelApi;

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Repair } from "../types/repair.interface";
import {
	type CreateRepairRecordParams,
	type DeleteRepairRecordsParams,
	type GetRepairRecordsParams,
	RepairUsecase,
} from "../usecases/repairUsecase";

const repairUsecase = new RepairUsecase();

export const repairApi = createApi({
	reducerPath: "repairApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Repair"],
	endpoints: (builder) => ({
		// 수리 내역 조회
		getRepairRecords: builder.query<Repair[], GetRepairRecordsParams>({
			queryFn: async (params) => {
				try {
					const records = await repairUsecase.getRepairRecords(params);
					return { data: records };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "수리 내역 조회 실패",
						},
					};
				}
			},
			providesTags: (result, error, params) => [
				{ type: "Repair", id: `${params.vehicleNumber}-${params.date}` },
				// 개별 수리 내역에도 태그 추가 (세밀한 캐시 관리)
				...(result?.map((record) => ({
					type: "Repair" as const,
					id: record.id,
				})) || []),
			],
		}),

		// 수리 내역 생성
		createRepairRecord: builder.mutation<Repair, CreateRepairRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await repairUsecase.createRepairRecord(params);
					return { data: record };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "수리 내역 생성 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Repair", id: `${params.vehicleNumber}-${params.date}` },
				// 생성된 기록의 개별 태그도 무효화
				...(result ? [{ type: "Repair" as const, id: result.id }] : []),
			],
			// 낙관적 업데이트 추가 (더 빠른 UI 반응)
			onQueryStarted: async (params, { dispatch, queryFulfilled }) => {
				try {
					const { data: newRecord } = await queryFulfilled;

					// 기존 쿼리 결과에 새 레코드 추가
					dispatch(
						repairApi.util.updateQueryData(
							"getRepairRecords",
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

		// 수리 내역 삭제 (해당 날짜의 모든 기록)
		deleteRepairRecords: builder.mutation<void, DeleteRepairRecordsParams>({
			queryFn: async (params) => {
				try {
					await repairUsecase.deleteRepairRecords(params);
					return { data: undefined };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "수리 내역 삭제 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Repair", id: `${params.vehicleNumber}-${params.date}` },
				// 모든 Repair 태그 무효화 (삭제 시에는 안전하게)
				{ type: "Repair", id: "LIST" },
			],
			// 낙관적 업데이트 추가
			onQueryStarted: async (params, { dispatch, queryFulfilled }) => {
				// 삭제 전 UI에서 미리 제거
				const patchResult = dispatch(
					repairApi.util.updateQueryData(
						"getRepairRecords",
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
	useGetRepairRecordsQuery,
	useCreateRepairRecordMutation,
	useDeleteRepairRecordsMutation,
} = repairApi;

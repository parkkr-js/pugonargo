import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Repair, RepairWithGroup } from "../types/repair.interface";
import type {
	CreateRepairRecordParams,
	DeleteRepairRecordParams,
	GetRepairRecordParams,
	GetRepairRecordsParams,
	UpdateRepairRecordParams,
} from "../types/repair.interface";
import { RepairUsecase } from "../usecases/repairUsecase";

const repairUsecase = new RepairUsecase();

export const repairApi = createApi({
	reducerPath: "repairApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Repair"],
	endpoints: (builder) => ({
		// 날짜별 조회
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
								error instanceof Error ? error.message : "정비 내역 조회 실패",
						},
					};
				}
			},
			providesTags: (result, error, params) => [
				{ type: "Repair", id: `${params.vehicleNumber}-${params.date}` },
				...(result?.map((record) => ({
					type: "Repair" as const,
					id: record.id,
				})) || []),
			],
		}),

		// 개별 조회
		getRepairRecord: builder.query<Repair, GetRepairRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await repairUsecase.getRepairRecord(params);
					return { data: record };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "정비 내역 조회 실패",
						},
					};
				}
			},
			providesTags: (result, error, params) => [
				{ type: "Repair", id: params.recordId },
			],
		}),

		// 생성
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
								error instanceof Error ? error.message : "정비 내역 생성 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Repair", id: `${params.vehicleNumber}-${params.date}` },
				...(result ? [{ type: "Repair" as const, id: result.id }] : []),
			],
		}),

		// 개별 수정
		updateRepairRecord: builder.mutation<Repair, UpdateRepairRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await repairUsecase.updateRepairRecord(params);
					return { data: record };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "정비 내역 수정 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Repair", id: params.recordId },
				...(result
					? [
							{
								type: "Repair" as const,
								id: `${result.vehicleNumber}-${result.year}-${result.month}-${result.day}`,
							},
						]
					: []),
			],
		}),

		// 개별 삭제
		deleteRepairRecord: builder.mutation<void, DeleteRepairRecordParams>({
			queryFn: async (params) => {
				try {
					await repairUsecase.deleteRepairRecord(params);
					return { data: undefined };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "정비 내역 삭제 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Repair", id: params.recordId },
				{ type: "Repair", id: "LIST" },
			],
		}),

		// yyyy-mm 형식의 날짜로 조회
		getRepairRecordsByDate: builder.query<RepairWithGroup[], string>({
			queryFn: async (date) => {
				try {
					const records = await repairUsecase.getRepairRecordsByDate(date);
					return { data: records };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "정비 내역 조회 실패",
						},
					};
				}
			},
			providesTags: (result, error, date) => [
				{ type: "Repair", id: `monthly-${date}` },
				...(result?.map((record) => ({
					type: "Repair" as const,
					id: record.id,
				})) || []),
			],
		}),
	}),
});

export const {
	useGetRepairRecordsQuery,
	useGetRepairRecordQuery,
	useCreateRepairRecordMutation,
	useUpdateRepairRecordMutation,
	useDeleteRepairRecordMutation,
	useGetRepairRecordsByDateQuery,
} = repairApi;

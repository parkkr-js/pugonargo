import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Fuel } from "../types/fuel.interface";
import {
	type CreateFuelRecordParams,
	type DeleteFuelRecordParams,
	type DeleteFuelRecordsParams,
	FuelUsecase,
	type GetFuelRecordParams,
	type GetFuelRecordsParams,
	type UpdateFuelRecordParams,
} from "../usecases/fuelUsecase";

const fuelUsecase = new FuelUsecase();

export const fuelApi = createApi({
	reducerPath: "fuelApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Fuel"],
	endpoints: (builder) => ({
		// 기존: 날짜별 조회
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
				...(result?.map((record) => ({
					type: "Fuel" as const,
					id: record.id,
				})) || []),
			],
		}),

		// ✅ 새로 추가: 개별 조회
		getFuelRecord: builder.query<Fuel, GetFuelRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await fuelUsecase.getFuelRecord(params);
					return { data: record };
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
				{ type: "Fuel", id: params.recordId },
			],
		}),

		// 기존: 생성
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
				...(result ? [{ type: "Fuel" as const, id: result.id }] : []),
			],
		}),

		// ✅ 새로 추가: 개별 수정
		updateFuelRecord: builder.mutation<Fuel, UpdateFuelRecordParams>({
			queryFn: async (params) => {
				try {
					const record = await fuelUsecase.updateFuelRecord(params);
					return { data: record };
				} catch (error) {
					return {
						error: {
							status: "CUSTOM_ERROR",
							error:
								error instanceof Error ? error.message : "연료 기록 수정 실패",
						},
					};
				}
			},
			invalidatesTags: (result, error, params) => [
				{ type: "Fuel", id: params.recordId },
				// 해당 날짜의 전체 목록도 무효화
				...(result
					? [
							{
								type: "Fuel" as const,
								id: `${result.vehicleNumber}-${result.year}-${result.month}-${result.day}`,
							},
						]
					: []),
			],
		}),

		// ✅ 새로 추가: 개별 삭제
		deleteFuelRecord: builder.mutation<void, DeleteFuelRecordParams>({
			queryFn: async (params) => {
				try {
					await fuelUsecase.deleteFuelRecord(params);
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
				{ type: "Fuel", id: params.recordId },
				{ type: "Fuel", id: "LIST" }, // 전체 목록 무효화
			],
		}),

		// 기존: 날짜별 전체 삭제 (유지)
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
				{ type: "Fuel", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetFuelRecordsQuery,
	useGetFuelRecordQuery,
	useCreateFuelRecordMutation,
	useUpdateFuelRecordMutation,
	useDeleteFuelRecordMutation,
	useDeleteFuelRecordsMutation,
} = fuelApi;

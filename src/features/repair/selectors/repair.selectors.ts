import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";
import { repairApi } from "../api/repair.api";
import type { Repair } from "../types/repair.interface";
import type { GetRepairRecordsParams } from "../usecases/repairUsecase";

// RTK Query result selector
export const selectRepairRecordsResult = (params: GetRepairRecordsParams) =>
	repairApi.endpoints.getRepairRecords.select(params);

// 총 정비비용 계산 selector
export const selectTotalRepairCost = createSelector(
	[
		(state: RootState, params: GetRepairRecordsParams) =>
			selectRepairRecordsResult(params)(state)?.data || [],
	],
	(repairRecords: Repair[]) => {
		return repairRecords.reduce(
			(total, record) => total + record.repairCost,
			0,
		);
	},
);

// 수리 내역 통계 selector
export const selectRepairStatistics = createSelector(
	[
		(state: RootState, params: GetRepairRecordsParams) =>
			selectRepairRecordsResult(params)(state)?.data || [],
	],
	(repairRecords: Repair[]) => {
		// 객체를 매번 새로 생성하지 않도록 메모이제이션
		const totalCost = repairRecords.reduce(
			(total, record) => total + record.repairCost,
			0,
		);

		// Object.freeze를 사용하여 객체를 불변으로 만듦
		return Object.freeze({
			totalCost,
			recordCount: repairRecords.length,
		});
	},
);

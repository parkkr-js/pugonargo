// src/features/fuel/selectors/fuel.selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";
import { fuelApi } from "../api/fuel.api";
import type { Fuel } from "../types/fuel.interface";
import type { GetFuelRecordsParams } from "../usecases/fuelUsecase";

// RTK Query result selector
export const selectFuelRecordsResult = (params: GetFuelRecordsParams) =>
	fuelApi.endpoints.getFuelRecords.select(params);

// 총 주유비 계산 selector
export const selectTotalFuelCost = createSelector(
	[
		(state: RootState, params: GetFuelRecordsParams) =>
			selectFuelRecordsResult(params)(state)?.data || [],
	],
	(fuelRecords: Fuel[]) => {
		return fuelRecords.reduce(
			(total, record) => total + record.totalFuelCost,
			0,
		);
	},
);

// 총 주유량 계산 selector
export const selectTotalFuelAmount = createSelector(
	[
		(state: RootState, params: GetFuelRecordsParams) =>
			selectFuelRecordsResult(params)(state)?.data || [],
	],
	(fuelRecords: Fuel[]) => {
		return fuelRecords.reduce((total, record) => total + record.fuelAmount, 0);
	},
);

// 평균 단가 계산 selector
export const selectAverageFuelPrice = createSelector(
	[
		(state: RootState, params: GetFuelRecordsParams) =>
			selectFuelRecordsResult(params)(state)?.data || [],
	],
	(fuelRecords: Fuel[]) => {
		if (fuelRecords.length === 0) return 0;

		const totalPrice = fuelRecords.reduce(
			(total, record) => total + record.fuelPrice,
			0,
		);
		return Math.round(totalPrice / fuelRecords.length);
	},
);

// 연료 기록 통계 selector
export const selectFuelStatistics = createSelector(
	[
		(state: RootState, params: GetFuelRecordsParams) =>
			selectFuelRecordsResult(params)(state)?.data || [],
	],
	(fuelRecords: Fuel[]) => {
		// 객체를 매번 새로 생성하지 않도록 메모이제이션
		const totalCost = fuelRecords.reduce(
			(total, record) => total + record.totalFuelCost,
			0,
		);
		const totalAmount = fuelRecords.reduce(
			(total, record) => total + record.fuelAmount,
			0,
		);
		const averagePrice =
			fuelRecords.length > 0
				? Math.round(
						fuelRecords.reduce((total, record) => total + record.fuelPrice, 0) /
							fuelRecords.length,
					)
				: 0;

		// Object.freeze를 사용하여 객체를 불변으로 만듦
		return Object.freeze({
			totalCost,
			totalAmount,
			averagePrice,
			recordCount: fuelRecords.length,
		});
	},
);

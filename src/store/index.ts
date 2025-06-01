//src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/application/api/auth.api";
import { driverApi } from "../features/drivers/application/api/driver.api";
import { fuelApi } from "../features/fuel/api/fuel.api";
import { operationLogApi } from "../features/operationLog/api/operationLog.api";
import { paymentSummaryApi } from "../features/paymentSummary/api/paymentSummary.api";
import { repairApi } from "../features/repair/api/repair.api";
import { statisticsByPeriodApi } from "../features/statisticsByPeriod/api/statisticsByPeriod.api";

export const store = configureStore({
	reducer: {
		[authApi.reducerPath]: authApi.reducer,
		[driverApi.reducerPath]: driverApi.reducer,
		[paymentSummaryApi.reducerPath]: paymentSummaryApi.reducer,
		[fuelApi.reducerPath]: fuelApi.reducer,
		[repairApi.reducerPath]: repairApi.reducer,
		[operationLogApi.reducerPath]: operationLogApi.reducer,
		[statisticsByPeriodApi.reducerPath]: statisticsByPeriodApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			authApi.middleware,
			driverApi.middleware,
			paymentSummaryApi.middleware,
			fuelApi.middleware,
			repairApi.middleware,
			operationLogApi.middleware,
			statisticsByPeriodApi.middleware,
		),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/application/api/auth.api";
import { driverApi } from "../features/drivers/application/api/driver.api";

export const store = configureStore({
	reducer: {
		[authApi.reducerPath]: authApi.reducer,
		[driverApi.reducerPath]: driverApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(authApi.middleware, driverApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

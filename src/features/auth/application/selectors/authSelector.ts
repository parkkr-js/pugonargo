// src/features/auth/application/selectors/authSelector.ts
import { createSelector } from "@reduxjs/toolkit";
import type { AuthUser } from "../../domain/entities/AuthTypes";
import { authApi } from "../api/auth.api";

// RTK Query의 내장 셀렉터 사용
const selectRestoreSessionResult = authApi.endpoints.restoreSession.select();

/**
 * 로그인된 사용자 정보를 가져오는 기본 셀렉터
 */
export const selectCurrentUser = createSelector(
	[selectRestoreSessionResult],
	(result) => result?.data || null,
);

/**
 * 로그인된 사용자의 차량번호를 선택하는 셀렉터
 * 관리자나 로그인되지 않은 경우 빈 문자열을 반환
 */
export const selectCurrentUserVehicleNumber = createSelector(
	[selectCurrentUser],
	(user: AuthUser | null) => {
		if (!user) return "";
		return user.vehicleNumber || "";
	},
);

/**
 * 현재 로그인된 사용자가 기사님인지 확인하는 셀렉터
 */
export const selectIsDriver = createSelector(
	[selectCurrentUser],
	(user: AuthUser | null) => user?.userType === "driver",
);

/**
 * 현재 로그인된 사용자가 관리자인지 확인하는 셀렉터
 */
export const selectIsAdmin = createSelector(
	[selectCurrentUser],
	(user: AuthUser | null) => user?.userType === "admin",
);

/**
 * 인증 상태 확인 셀렉터
 */
export const selectIsAuthenticated = createSelector(
	[selectCurrentUser],
	(user: AuthUser | null) => user !== null,
);

/**
 * 로딩 상태 확인 셀렉터
 */
export const selectAuthLoading = createSelector(
	[selectRestoreSessionResult],
	(result) => result?.isLoading || false,
);

/**
 * 에러 상태 확인 셀렉터
 */
export const selectAuthError = createSelector(
	[selectRestoreSessionResult],
	(result) => result?.error || null,
);

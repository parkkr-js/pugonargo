import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { message } from "antd";
import type {
	AuthUser,
	LoginCredentials,
} from "../../domain/entities/AuthTypes";
import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import { FirebaseAuthService } from "../../domain/services/FirebaseAuthService";

const authRepository: IAuthRepository = new FirebaseAuthService();
const AUTH_STORAGE_KEY = "auth_user";

const handleApiError = (
	error: unknown,
	fallbackMessage: string,
): FetchBaseQueryError => {
	console.error("Auth API Error:", error);
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;
	return { status: "CUSTOM_ERROR", error: errorMessage };
};

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/",
	}),
	tagTypes: ["Auth"],
	endpoints: (builder) => ({
		// 로그인
		login: builder.mutation<AuthUser, LoginCredentials>({
			queryFn: async (credentials) => {
				try {
					const user = await authRepository.authenticate(credentials);
					localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
					return { data: user };
				} catch (error) {
					console.error("Login failed:", error);
					return { error: handleApiError(error, "로그인에 실패했습니다.") };
				}
			},
			onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
				try {
					const { data: user } = await queryFulfilled;

					dispatch(
						authApi.util.updateQueryData(
							"restoreSession",
							undefined,
							() => user,
						),
					);

					message.success({
						content: `${user.userType === "admin" ? "관리자" : "기사"} 로그인에 성공했습니다!`,
						duration: 2,
					});
				} catch (error) {
					console.error("Login mutation failed:", error);
					message.error({
						content:
							error instanceof Error ? error.message : "로그인에 실패했습니다.",
						duration: 3,
					});
				}
			},
			invalidatesTags: ["Auth"],
		}),

		// 로그아웃
		logout: builder.mutation<void, void>({
			queryFn: async () => {
				try {
					await authRepository.logout();

					localStorage.removeItem(AUTH_STORAGE_KEY);
					return { data: undefined };
				} catch (error) {
					return { error: handleApiError(error, "로그아웃에 실패했습니다.") };
				}
			},
			onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
				try {
					await queryFulfilled;

					dispatch(
						authApi.util.updateQueryData(
							"restoreSession",
							undefined,
							() => null,
						),
					);

					message.success({
						content: "로그아웃되었습니다.",
						duration: 2,
					});
				} catch (error) {
					message.error({
						content:
							error instanceof Error
								? error.message
								: "로그아웃에 실패했습니다.",
						duration: 3,
					});
				}
			},
			invalidatesTags: ["Auth"],
		}),

		// 세션 복구
		restoreSession: builder.query<AuthUser | null, void>({
			queryFn: async () => {
				try {
					// Firebase 세션 먼저 확인
					const firebaseUser = await authRepository.restoreSession();
					if (firebaseUser) {
						// Firebase 세션이 있으면 localStorage 업데이트
						localStorage.setItem(
							AUTH_STORAGE_KEY,
							JSON.stringify(firebaseUser),
						);
						return { data: firebaseUser };
					}

					// Firebase 세션이 없으면 localStorage 확인
					const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
					if (storedUser) {
						const user = JSON.parse(storedUser) as AuthUser;
						// localStorage의 정보로 Firebase 세션 복구 시도
						try {
							const restoredUser = await authRepository.restoreSession();
							if (restoredUser) {
								return { data: restoredUser };
							}
						} catch (error) {
							console.warn("Failed to restore Firebase session:", error);
						}
						return { data: user };
					}

					return { data: null };
				} catch (error) {
					console.error("Session restore error:", error);
					return { error: handleApiError(error, "세션 복구에 실패했습니다.") };
				}
			},
			providesTags: ["Auth"],
		}),
	}),
});

export const { useLoginMutation, useLogoutMutation, useRestoreSessionQuery } =
	authApi;

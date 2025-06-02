import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User } from "../types/auth";

// 인증 스토어 생성 (localStorage persistence 포함)
export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,

			// 로그인
			login: (user: User) => {
				set({
					user,
					isAuthenticated: true,
					isLoading: false,
				});
			},

			// 로그아웃
			logout: () => {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			// 로딩 상태 설정
			setLoading: (isLoading: boolean) => {
				set({ isLoading });
			},

			// 관리자 여부 확인
			isAdmin: () => {
				const { user } = get();
				return user?.role === "admin";
			},

			// 기사 여부 확인
			isDriver: () => {
				const { user } = get();
				return user?.role === "driver";
			},
		}),
		{
			name: "auth-storage", // localStorage 키
			// 저장할 상태 선택 (isLoading은 제외)
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

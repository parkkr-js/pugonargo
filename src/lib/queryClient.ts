import { QueryClient } from "@tanstack/react-query";

// Query Client 생성
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 5분간 fresh 상태 유지
			staleTime: 5 * 60 * 1000,
			// 에러 시 재시도 (인증 에러는 재시도 안함)
			retry: (failureCount, error) => {
				if (error instanceof Error) {
					const message = error.message.toLowerCase();
					if (
						message.includes("permission") ||
						message.includes("unauthorized")
					) {
						return false;
					}
				}
				return failureCount < 3;
			},
			// 재시도 간격 (exponential backoff)
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
		mutations: {
			// 뮤테이션은 기본적으로 재시도 안함
			retry: false,
		},
	},
});

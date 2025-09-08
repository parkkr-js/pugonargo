import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { deleteMonthlyData } from "../../../../services/data-management/deleteMonthlyData";
import { fetchMonthlyStats } from "../../../../services/data-management/fetchMonthlyStats";
import type { MonthlyStatsListItem } from "../../../../types/dataManagement";

export const useMonthlyStats = () => {
	const queryClient = useQueryClient();

	// 1시간 캐싱
	const {
		data: monthlyStats = [],
		refetch,
		isFetching,
	} = useQuery<MonthlyStatsListItem[]>({
		queryKey: ["monthlyStats"],
		queryFn: fetchMonthlyStats,
		staleTime: 1000 * 60 * 60, // 1시간
		cacheTime: 1000 * 60 * 60, // 1시간
	});

	// 삭제 뮤테이션
	const deleteMutation = useMutation({
		mutationFn: deleteMonthlyData,
		onSuccess: (_, monthId) => {
			message.success(`${monthId} 월 데이터가 성공적으로 삭제되었습니다.`);
			// 캐시 무효화하여 최신 데이터 다시 조회
			queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
		},
		onError: (error: Error) => {
			message.error(error.message);
		},
	});

	const handleDelete = async (monthId: string) => {
		try {
			await deleteMutation.mutateAsync(monthId);
		} catch (error) {
			// 에러는 mutation의 onError에서 처리됨
		}
	};

	const handleRefresh = () => {
		refetch();
	};

	return {
		monthlyStats,
		isFetching,
		handleDelete,
		handleRefresh,
		isDeleting: deleteMutation.isPending,
	};
};

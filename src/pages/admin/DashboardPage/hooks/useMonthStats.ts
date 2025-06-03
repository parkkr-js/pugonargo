import { useQuery } from "@tanstack/react-query";
import { fetchMonthlyStats } from "../../../../services/dashboard/fetchMonthlyStats";

export function useMonthStats(monthId: string) {
	return useQuery({
		queryKey: ["monthlyStats", monthId],
		queryFn: async () => {
			const data = await fetchMonthlyStats(monthId);
			if (!data) return null;
			return {
				totalI: data.totalI ?? 0,
				totalO: data.totalO ?? 0,
			};
		},
		enabled: !!monthId,
	});
}

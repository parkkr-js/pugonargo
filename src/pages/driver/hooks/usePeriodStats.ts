import { useQuery } from "@tanstack/react-query";
import { fetchPeriodStats } from "../../../services/client/fetchPeriodStats";

export function usePeriodStats(vehicleNumber: string, start: Date, end: Date) {
	return useQuery({
		queryKey: [
			"periodStats",
			vehicleNumber,
			start.toISOString(),
			end.toISOString(),
		],
		queryFn: () => fetchPeriodStats(vehicleNumber, start, end),
		enabled: !!vehicleNumber && !!start && !!end,
	});
}

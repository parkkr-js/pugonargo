import { useQuery } from "@tanstack/react-query";
import { fetchPeriodStats } from "../../../services/client/fetchPeriodStats";

export function usePeriodStats(
	vehicleNumber: string,
	driversDbSupplier: string,
	start: Date,
	end: Date,
) {
	return useQuery({
		queryKey: [
			"periodStats",
			vehicleNumber,
			driversDbSupplier,
			start.toISOString(),
			end.toISOString(),
		],
		queryFn: () =>
			fetchPeriodStats(vehicleNumber, driversDbSupplier, start, end),
		enabled: !!vehicleNumber && !!start && !!end,
	});
}

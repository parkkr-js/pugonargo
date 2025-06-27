import { useQuery } from "@tanstack/react-query";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";

export function useDailyRecords(
	vehicleNumber: string,
	driversDbSupplier: string,
	date: Date,
) {
	return useQuery({
		queryKey: [
			"dailyRecords",
			vehicleNumber,
			driversDbSupplier,
			date.toISOString(),
		],
		queryFn: () => fetchDailyRecords(vehicleNumber, driversDbSupplier, date),
		enabled: !!vehicleNumber && !!driversDbSupplier && !!date,
	});
}

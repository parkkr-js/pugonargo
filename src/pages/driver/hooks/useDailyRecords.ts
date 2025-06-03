import { useQuery } from "@tanstack/react-query";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";

export function useDailyRecords(vehicleNumber: string, date: Date) {
	return useQuery({
		queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
		queryFn: () => fetchDailyRecords(vehicleNumber, date),
		enabled: !!vehicleNumber && !!date,
	});
}

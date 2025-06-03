import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../../../../services/transaction/fetchTransactions";

export function useTransactions(startDate: string, endDate: string) {
	return useQuery({
		queryKey: ["transactions", startDate, endDate],
		queryFn: () => fetchTransactions(startDate, endDate),
		keepPreviousData: true,
		refetchOnWindowFocus: false,
	});
}

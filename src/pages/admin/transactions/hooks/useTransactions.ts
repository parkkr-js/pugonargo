import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../../../../services/transaction/fetchTransactions";
import type { Transaction } from "../../../../types/transaction";

export function useTransactions(startDate: string, endDate: string) {
	return useQuery<Transaction[], Error>({
		queryKey: ["transactions", startDate, endDate],
		queryFn: () => fetchTransactions(startDate, endDate),
		select: (data) =>
			data.map((item) => ({
				id: item.id,
				date: item.date,
				vehicleNumber: item.vehicleNumber,
				route: item.route,
				weight: item.weight,
				unitPrice: item.unitPrice,
				amount: item.amount,
				note: item.note,
				i: item.i,
			})),
	});
}

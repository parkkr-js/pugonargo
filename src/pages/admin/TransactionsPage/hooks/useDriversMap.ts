import { useQuery } from "@tanstack/react-query";
import { fetchDriversMap } from "../../../../services/transaction/fetchDriversMap";
import type { DriversMap } from "../../../../types/transaction";

export function useDriversMap() {
	return useQuery<DriversMap, Error>({
		queryKey: ["driversMap"] as const,
		queryFn: fetchDriversMap,
		staleTime: Number.POSITIVE_INFINITY,
	});
}

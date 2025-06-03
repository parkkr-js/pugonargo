import { useQuery } from "@tanstack/react-query";
import { fetchDriversMap } from "../../../../services/dashboard/fetchDriversMap";

export function useDriversMap() {
	return useQuery({
		queryKey: ["driversMap"],
		queryFn: fetchDriversMap,
		staleTime: Number.POSITIVE_INFINITY,
	});
}

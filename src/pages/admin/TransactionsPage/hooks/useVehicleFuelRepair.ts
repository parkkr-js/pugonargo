import { useQuery } from "@tanstack/react-query";
import { fetchVehicleFuelRepair } from "../../../../services/transaction/fetchVehicleFuelRepair";

export function useVehicleFuelRepair(vehicleNumber: string, open: boolean) {
	return useQuery({
		queryKey: ["vehicleFuelRepair", vehicleNumber],
		queryFn: () => fetchVehicleFuelRepair(vehicleNumber),
		enabled: open && !!vehicleNumber,
	});
}

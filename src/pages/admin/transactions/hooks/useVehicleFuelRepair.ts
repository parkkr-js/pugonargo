import { useQuery } from "@tanstack/react-query";
import { fetchVehicleFuelRepair } from "../../../../services/transaction/fetchVehicleFuelRepair";
import type { VehicleFuelRepairRow } from "../../../../types/transaction";

export const useVehicleFuelRepair = (
	vehicleNumber: string,
	enabled: boolean,
) => {
	return useQuery<VehicleFuelRepairRow[]>({
		queryKey: ["vehicleFuelRepair", vehicleNumber],
		queryFn: () => fetchVehicleFuelRepair(vehicleNumber),
		enabled,
	});
};

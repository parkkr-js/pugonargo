import { useDriverStore } from "../../../stores/driverStore";

export function useCurrentDriverVehicleNumber(): string {
	return useDriverStore((state) => state.vehicleNumber);
}

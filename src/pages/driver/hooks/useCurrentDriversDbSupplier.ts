import { useDriverStore } from "../../../stores/driverStore";

export const useCurrentDriversDbSupplier = () => {
	const driversDbSupplier = useDriverStore((s) => s.driversDbSupplier);
	return driversDbSupplier;
};

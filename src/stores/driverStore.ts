import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DriverState {
	vehicleNumber: string;
	driversDbSupplier: string;
	setVehicleNumber: (vehicleNumber: string) => void;
	setDriversDbSupplier: (driversDbSupplier: string) => void;
}

export const useDriverStore = create<DriverState>()(
	persist(
		(set) => ({
			vehicleNumber: "",
			driversDbSupplier: "",
			setVehicleNumber: (vehicleNumber) => set({ vehicleNumber }),
			setDriversDbSupplier: (driversDbSupplier) => set({ driversDbSupplier }),
		}),
		{ name: "driver-store" },
	),
);

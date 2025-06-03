import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DriverState {
	vehicleNumber: string;
	setVehicleNumber: (vehicleNumber: string) => void;
}

export const useDriverStore = create<DriverState>()(
	persist(
		(set) => ({
			vehicleNumber: "",
			setVehicleNumber: (vehicleNumber) => set({ vehicleNumber }),
		}),
		{ name: "driver-store" },
	),
);

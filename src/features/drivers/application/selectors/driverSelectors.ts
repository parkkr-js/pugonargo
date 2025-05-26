import type { Driver } from "../../domain/entities/Driver";

export const selectDriversByGroup = (
	drivers: Driver[],
	group: string,
): Driver[] => {
	return drivers.filter((driver) => driver.group === group);
};

export const selectDriverById = (
	drivers: Driver[],
	id: string,
): Driver | undefined => {
	return drivers.find((driver) => driver.id === id);
};

export const selectDriversByVehicleNumber = (
	drivers: Driver[],
	vehicleNumber: string,
): Driver | undefined => {
	return drivers.find((driver) => driver.vehicleNumber === vehicleNumber);
};

export const selectDriversSortedByGroup = (drivers: Driver[]): Driver[] => {
	return [...drivers].sort((a, b) => {
		const groupA = Number.parseInt(a.group.replace("#", ""));
		const groupB = Number.parseInt(b.group.replace("#", ""));
		return groupA - groupB;
	});
};

export const selectDriversSortedByVehicleNumber = (
	drivers: Driver[],
): Driver[] => {
	return [...drivers].sort((a, b) =>
		a.vehicleNumber.localeCompare(b.vehicleNumber),
	);
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type FuelRecordInput,
	createFuelRecord,
} from "../../../services/client/createFuelRecord";
import { deleteFuelRecord } from "../../../services/client/deleteFuelRecord";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";
import { updateFuelRecord } from "../../../services/client/updateFuelRecord";

export function useFuelRecords(
	vehicleNumber: string,
	driversDbSupplier: string,
	date: Date,
) {
	return useQuery({
		queryKey: [
			"fuelRecords",
			vehicleNumber,
			driversDbSupplier,
			date.toISOString(),
		],
		queryFn: () => fetchDailyRecords(vehicleNumber, driversDbSupplier, date),
		select: (data) => data?.fuelRecords ?? [],
		enabled: !!vehicleNumber && !!driversDbSupplier && !!date,
	});
}

export function useCreateFuelRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(createFuelRecord, {
		onSuccess: () => {
			if (vehicleNumber && driversDbSupplier && date) {
				queryClient.invalidateQueries({
					queryKey: [
						"dailyRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: [
						"fuelRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["periodStats"],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
				queryClient.invalidateQueries({ queryKey: ["periodStats"] });
			}
		},
	});
}

export function useUpdateFuelRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(
		({ id, data }: { id: string; data: Partial<FuelRecordInput> }) =>
			updateFuelRecord(id, data),
		{
			onSuccess: () => {
				if (vehicleNumber && driversDbSupplier && date) {
					queryClient.invalidateQueries({
						queryKey: [
							"dailyRecords",
							vehicleNumber,
							driversDbSupplier,
							date.toISOString(),
						],
					});
					queryClient.invalidateQueries({
						queryKey: [
							"fuelRecords",
							vehicleNumber,
							driversDbSupplier,
							date.toISOString(),
						],
					});
					queryClient.invalidateQueries({
						queryKey: ["periodStats"],
					});
				} else {
					queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
					queryClient.invalidateQueries({ queryKey: ["periodStats"] });
				}
			},
		},
	);
}

export function useDeleteFuelRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(deleteFuelRecord, {
		onSuccess: () => {
			if (vehicleNumber && driversDbSupplier && date) {
				queryClient.invalidateQueries({
					queryKey: [
						"dailyRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: [
						"fuelRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["periodStats"],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
				queryClient.invalidateQueries({ queryKey: ["periodStats"] });
			}
		},
	});
}

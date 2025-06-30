import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type RepairRecordInput,
	createRepairRecord,
} from "../../../services/client/createRepairRecord";
import { deleteRepairRecord } from "../../../services/client/deleteRepairRecord";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";
import { updateRepairRecord } from "../../../services/client/updateRepairRecord";

export function useRepairRecords(
	vehicleNumber: string,
	driversDbSupplier: string,
	date: Date,
) {
	return useQuery({
		queryKey: [
			"repairRecords",
			vehicleNumber,
			driversDbSupplier,
			date.toISOString(),
		],
		queryFn: () => fetchDailyRecords(vehicleNumber, driversDbSupplier, date),
		select: (data) => data?.repairRecords ?? [],
		enabled: !!vehicleNumber && !!driversDbSupplier && !!date,
	});
}

export function useCreateRepairRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(createRepairRecord, {
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
						"repairRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["periodStats"],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
				queryClient.invalidateQueries({ queryKey: ["periodStats"] });
			}
		},
	});
}

export function useUpdateRepairRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(
		({ id, data }: { id: string; data: Partial<RepairRecordInput> }) =>
			updateRepairRecord(id, data),
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
							"repairRecords",
							vehicleNumber,
							driversDbSupplier,
							date.toISOString(),
						],
					});
					queryClient.invalidateQueries({
						queryKey: ["periodStats"],
					});
				} else {
					queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
					queryClient.invalidateQueries({ queryKey: ["periodStats"] });
				}
			},
		},
	);
}

export function useDeleteRepairRecordMutation(
	vehicleNumber?: string,
	driversDbSupplier?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(deleteRepairRecord, {
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
						"repairRecords",
						vehicleNumber,
						driversDbSupplier,
						date.toISOString(),
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["periodStats"],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
				queryClient.invalidateQueries({ queryKey: ["periodStats"] });
			}
		},
	});
}

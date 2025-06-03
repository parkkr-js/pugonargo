import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type FuelRecordInput,
	createFuelRecord,
} from "../../../services/client/createFuelRecord";
import { deleteFuelRecord } from "../../../services/client/deleteFuelRecord";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";
import { updateFuelRecord } from "../../../services/client/updateFuelRecord";

export function useFuelRecords(vehicleNumber: string, date: Date) {
	return useQuery({
		queryKey: ["fuelRecords", vehicleNumber, date.toISOString()],
		queryFn: () => fetchDailyRecords(vehicleNumber, date),
		select: (data) => data?.fuelRecords ?? [],
		enabled: !!vehicleNumber && !!date,
	});
}

export function useCreateFuelRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(createFuelRecord, {
		onSuccess: () => {
			if (vehicleNumber && date) {
				queryClient.invalidateQueries({
					queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
				});
				queryClient.invalidateQueries({
					queryKey: ["fuelRecords", vehicleNumber, date.toISOString()],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
			}
		},
	});
}

export function useUpdateFuelRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(
		({ id, data }: { id: string; data: Partial<FuelRecordInput> }) =>
			updateFuelRecord(id, data),
		{
			onSuccess: () => {
				if (vehicleNumber && date) {
					queryClient.invalidateQueries({
						queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
					});
					queryClient.invalidateQueries({
						queryKey: ["fuelRecords", vehicleNumber, date.toISOString()],
					});
				} else {
					queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
				}
			},
		},
	);
}

export function useDeleteFuelRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(deleteFuelRecord, {
		onSuccess: () => {
			if (vehicleNumber && date) {
				queryClient.invalidateQueries({
					queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
				});
				queryClient.invalidateQueries({
					queryKey: ["fuelRecords", vehicleNumber, date.toISOString()],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["fuelRecords"] });
			}
		},
	});
}

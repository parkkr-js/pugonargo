import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type RepairRecordInput,
	createRepairRecord,
} from "../../../services/client/createRepairRecord";
import { deleteRepairRecord } from "../../../services/client/deleteRepairRecord";
import { fetchDailyRecords } from "../../../services/client/fetchDailyRecords";
import { updateRepairRecord } from "../../../services/client/updateRepairRecord";

export function useRepairRecords(vehicleNumber: string, date: Date) {
	return useQuery({
		queryKey: ["repairRecords", vehicleNumber, date.toISOString()],
		queryFn: () => fetchDailyRecords(vehicleNumber, date),
		select: (data) => data?.repairRecords ?? [],
		enabled: !!vehicleNumber && !!date,
	});
}

export function useCreateRepairRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(createRepairRecord, {
		onSuccess: () => {
			if (vehicleNumber && date) {
				queryClient.invalidateQueries({
					queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
				});
				queryClient.invalidateQueries({
					queryKey: ["repairRecords", vehicleNumber, date.toISOString()],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
			}
		},
	});
}

export function useUpdateRepairRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(
		({ id, data }: { id: string; data: Partial<RepairRecordInput> }) =>
			updateRepairRecord(id, data),
		{
			onSuccess: () => {
				if (vehicleNumber && date) {
					queryClient.invalidateQueries({
						queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
					});
					queryClient.invalidateQueries({
						queryKey: ["repairRecords", vehicleNumber, date.toISOString()],
					});
				} else {
					queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
				}
			},
		},
	);
}

export function useDeleteRepairRecordMutation(
	vehicleNumber?: string,
	date?: Date,
) {
	const queryClient = useQueryClient();
	return useMutation(deleteRepairRecord, {
		onSuccess: () => {
			if (vehicleNumber && date) {
				queryClient.invalidateQueries({
					queryKey: ["dailyRecords", vehicleNumber, date.toISOString()],
				});
				queryClient.invalidateQueries({
					queryKey: ["repairRecords", vehicleNumber, date.toISOString()],
				});
			} else {
				queryClient.invalidateQueries({ queryKey: ["repairRecords"] });
			}
		},
	});
}

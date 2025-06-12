import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDriver } from "../../../../services/driver/createDriver";
import { deleteDriver } from "../../../../services/driver/deleteDriver";
import { getDrivers } from "../../../../services/driver/getDrivers";
import { updateDriver } from "../../../../services/driver/updateDriver";
import type { Driver } from "../../../../types/driver";

export function useDriversQuery() {
	return useQuery<Driver[]>({
		queryKey: ["drivers"],
		queryFn: getDrivers,
	});
}

export function useCreateDriverMutation() {
	const queryClient = useQueryClient();
	return useMutation(createDriver, {
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
	});
}

export function useUpdateDriverMutation() {
	const queryClient = useQueryClient();
	return useMutation(
		({ id, data }: { id: string; data: Partial<Driver> }) =>
			updateDriver(id, data),
		{
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
		},
	);
}

export function useDeleteDriverMutation() {
	const queryClient = useQueryClient();
	return useMutation(deleteDriver, {
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
	});
}

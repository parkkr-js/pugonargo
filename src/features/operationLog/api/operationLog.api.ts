import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OperationLogService } from "../services/operationLogService";
import type {
	OperationLogCalculated,
	OperationLogRequest,
} from "../types/operationLog.types";
import { OperationLogUseCases } from "../usecases/operationLogUseCases";

const operationLogService = new OperationLogService();
const operationLogUseCases = new OperationLogUseCases(operationLogService);

const handleApiError = (
	error: unknown,
	fallbackMessage: string,
): FetchBaseQueryError => {
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;
	return {
		status: "CUSTOM_ERROR",
		error: errorMessage,
		data: { error: errorMessage },
	};
};

export const operationLogApi = createApi({
	reducerPath: "operationLogApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/" }),
	tagTypes: ["OperationLog"],
	endpoints: (builder) => ({
		getOperationLogs: builder.query<
			OperationLogCalculated[],
			OperationLogRequest
		>({
			queryFn: async (request: OperationLogRequest) => {
				try {
					const result =
						await operationLogUseCases.getCalculatedOperationLogs(request);
					return { data: result };
				} catch (error) {
					return {
						error: handleApiError(error, "운행내역을 불러오는데 실패했습니다."),
					};
				}
			},
			providesTags: (result, error, request) => [
				{
					type: "OperationLog",
					id: `${request.date}-${request.vehicleNumber}`,
				},
			],
		}),
	}),
});
export const { useGetOperationLogsQuery, useLazyGetOperationLogsQuery } =
	operationLogApi;

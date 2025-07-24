import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { saveDispatchData } from "../../../../services/dispatch/firebaseService";
import { fetchSheetData } from "../../../../services/dispatch/sheetDataService";
import { parseSheetToDispatchData } from "../../../../services/dispatch/sheetParserService";
import type {
	ProcessDispatchParams,
	ProcessDispatchResult,
} from "../../../../types/dispatch";

/**
 * 배차 데이터 처리 훅
 */
export const useDispatchProcessing = () => {
	const queryClient = useQueryClient();

	const processDispatchMutation = useMutation({
		mutationFn: async ({
			file,
			sheetName,
			accessToken,
		}: ProcessDispatchParams): Promise<ProcessDispatchResult> => {
			try {
				// 1. 시트 데이터 가져오기
				const { sheetData, originalData } = await fetchSheetData(
					file.id,
					sheetName,
					accessToken,
				);

				// 2. 시트 데이터 파싱
				const dispatchDataList = parseSheetToDispatchData(
					sheetData,
					file.id,
					file.name,
					sheetName,
					originalData,
				);

				// 3. Firebase에 저장
				const docId =
					dispatchDataList.length > 0 ? dispatchDataList[0].id : "unknown";

				// 모든 배차 데이터를 한 번에 저장
				await saveDispatchData(docId, dispatchDataList);

				return {
					docId,
					processedCount: dispatchDataList.length,
				};
			} catch (error) {
				throw new Error(`배차 데이터 처리 실패: ${error}`);
			}
		},
		onSuccess: (result) => {
			message.success(
				`배차 데이터 처리 완료! (${result.processedCount}건 처리됨, 문서 ID: ${result.docId})`,
			);

			// 캐시 무효화
			queryClient.invalidateQueries({ queryKey: ["dispatch", result.docId] });
		},
		onError: (error) => {
			message.error(
				`배차 데이터 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
			);
		},
	});

	return {
		processDispatch: processDispatchMutation.mutateAsync,
		isProcessing: processDispatchMutation.isPending,
		error: processDispatchMutation.error,
	};
};

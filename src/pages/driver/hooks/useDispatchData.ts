import { useQuery } from "@tanstack/react-query";
import { getDispatchByDate } from "../../../services/client/dispatchService";

/**
 * 기사님 배차 데이터 조회 훅
 */
export const useDispatchData = (docId: string) => {
	return useQuery({
		queryKey: ["driverDispatch", docId],
		queryFn: () => getDispatchByDate(docId),
		enabled: !!docId,
		staleTime: 5 * 60 * 1000, // 5분
	});
};

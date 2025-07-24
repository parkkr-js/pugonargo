import { useQuery } from "@tanstack/react-query";
import {
	getDispatchByDate,
	getDispatchByVehicle,
	getDispatchByVehicleAndSupplier,
} from "../../../../services/dispatch/firebaseService";

/**
 * 배차 데이터 조회 훅
 */
export const useDispatchData = (docId: string) => {
	return useQuery({
		queryKey: ["dispatch", docId],
		queryFn: () => getDispatchByDate(docId),
		enabled: !!docId,
	});
};

/**
 * 매입처별 배차 데이터 조회 훅
 */
export const useDispatchDataBySupplier = (docId: string, supplier: string) => {
	return useQuery({
		queryKey: ["dispatch", docId, "supplier", supplier],
		queryFn: () =>
			getDispatchByDate(docId).then((data) =>
				data.filter((item) => item.supplier === supplier),
			),
		enabled: !!docId && !!supplier,
	});
};

/**
 * 차량번호별 배차 데이터 조회 훅
 */
export const useDispatchDataByVehicle = (
	docId: string,
	vehicleNumber: string,
) => {
	return useQuery({
		queryKey: ["dispatch", docId, "vehicle", vehicleNumber],
		queryFn: () => getDispatchByVehicle(vehicleNumber),
		enabled: !!docId && !!vehicleNumber,
	});
};

/**
 * 매입처와 차량번호 조합으로 배차 데이터 조회 훅
 */
export const useDispatchDataByVehicleAndSupplier = (
	docId: string,
	vehicleNumber: string,
	supplier: string,
) => {
	return useQuery({
		queryKey: [
			"dispatch",
			docId,
			"vehicle",
			vehicleNumber,
			"supplier",
			supplier,
		],
		queryFn: () =>
			getDispatchByVehicleAndSupplier(docId, vehicleNumber, supplier),
		enabled: !!docId && !!vehicleNumber && !!supplier,
	});
};

import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { calculatePeriodStats } from "../../utils/calculationUtils";

export async function fetchPeriodStats(
	vehicleNumber: string,
	driversDbSupplier: string,
	start: Date,
	end: Date,
) {
	// 시작~끝 날짜를 YYYY-MM-DD string으로 변환
	const startStr = dayjs(start).format("YYYY-MM-DD");
	const endStr = dayjs(end).format("YYYY-MM-DD");

	// 운송 데이터 조회
	const rowQ = query(
		collection(db, "rawData"),
		where("d", "==", vehicleNumber),
		where("l", "==", driversDbSupplier),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const rowSnap = await getDocs(rowQ);
	const driveRecords = rowSnap.docs.map((doc) => {
		const data = doc.data();
		return {
			q: Number(data.q) || 0,
			m: Number(data.m) || 0,
		};
	});

	// 연료 데이터 조회
	const fuelQ = query(
		collection(db, "fuel"),
		where("vehicleNumber", "==", vehicleNumber),
		where("driversDbSupplier", "==", driversDbSupplier),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const fuelSnap = await getDocs(fuelQ);
	const fuelRecords = fuelSnap.docs.map((doc) => {
		const data = doc.data();
		return {
			totalFuelCost: Number(data.totalFuelCost) || 0,
		};
	});

	// 정비 데이터 조회
	const repairQ = query(
		collection(db, "repair"),
		where("vehicleNumber", "==", vehicleNumber),
		where("driversDbSupplier", "==", driversDbSupplier),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const repairSnap = await getDocs(repairQ);
	const repairRecords = repairSnap.docs.map((doc) => {
		const data = doc.data();
		return {
			repairCost: Number(data.repairCost) || 0,
		};
	});

	// 중앙화된 계산 유틸리티 사용
	const stats = calculatePeriodStats(driveRecords, fuelRecords, repairRecords);

	return {
		totalAmount: stats.totalAmount,
		totalDeduction: stats.totalDeduction,
		totalFuelCost: stats.totalFuelCost,
		totalRepairCost: stats.totalRepairCost,
	};
}

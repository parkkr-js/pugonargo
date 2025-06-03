import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchPeriodStats(
	vehicleNumber: string,
	start: Date,
	end: Date,
) {
	// 시작~끝 날짜를 YYYY-MM-DD string으로 변환
	const startStr = dayjs(start).format("YYYY-MM-DD");
	const endStr = dayjs(end).format("YYYY-MM-DD");

	const rowQ = query(
		collection(db, "rawData"),
		where("d", "==", vehicleNumber),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const rowSnap = await getDocs(rowQ);
	let totalAmount = 0;
	let totalDeduction = 0;
	let afterDeduction = 0;
	for (const doc of rowSnap.docs) {
		const data = doc.data();
		const q = Number(data.q) || 0;
		const m = Number(data.m) || 0;
		const o = Number(data.o) || 0;
		const amount = q * m;
		totalAmount += amount;
		totalDeduction += amount * 0.05;
		afterDeduction += o;
	}

	// fuel
	const fuelQ = query(
		collection(db, "fuel"),
		where("vehicleNumber", "==", vehicleNumber),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const fuelSnap = await getDocs(fuelQ);
	let totalFuelCost = 0;
	for (const doc of fuelSnap.docs) {
		totalFuelCost += Number(doc.data().totalFuelCost) || 0;
	}

	// repair
	const repairQ = query(
		collection(db, "repair"),
		where("vehicleNumber", "==", vehicleNumber),
		where("date", ">=", startStr),
		where("date", "<=", endStr),
	);
	const repairSnap = await getDocs(repairQ);
	let totalRepairCost = 0;
	for (const doc of repairSnap.docs) {
		totalRepairCost += Number(doc.data().repairCost) || 0;
	}

	return {
		totalAmount,
		totalDeduction: Math.round(totalDeduction),
		afterDeduction,
		totalFuelCost,
		totalRepairCost,
	};
}

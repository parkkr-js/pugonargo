// src/features/statisticsByPeriod/services/statisticsByPeriodService.ts

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import type {
	FuelRecord,
	OperationRecord,
	PeriodStatistics,
	RepairRecord,
} from "../types/statisticsByPeriod.interface";

class StatisticsByPeriodService {
	/**
	 * 기간별 통계 데이터 조회
	 * @param vehicleNumber 차량번호
	 * @param startDate 시작일 (YYYY-MM-DD)
	 * @param endDate 종료일 (YYYY-MM-DD)
	 * @returns PeriodStatistics 통계 데이터
	 */
	async getStatisticsByPeriod(
		vehicleNumber: string,
		startDate: string,
		endDate: string,
	): Promise<PeriodStatistics> {
		console.log(
			`📊 통계 조회 시작: ${vehicleNumber}, ${startDate} ~ ${endDate}`,
		);

		// 날짜 파싱 및 검증
		const { startYear, startMonth, startDay, endYear, endMonth, endDay } =
			this.parseDateRange(startDate, endDate);

		// 3가지 통계를 병렬로 조회 (성능 최적화)
		const [operationStats, fuelStats, repairStats] = await Promise.all([
			this.getOperationStatistics(
				vehicleNumber,
				startYear,
				startMonth,
				startDay,
				endYear,
				endMonth,
				endDay,
			),
			this.getFuelStatistics(
				vehicleNumber,
				startYear,
				startMonth,
				startDay,
				endYear,
				endMonth,
				endDay,
			),
			this.getRepairStatistics(
				vehicleNumber,
				startYear,
				startMonth,
				startDay,
				endYear,
				endMonth,
				endDay,
			),
		]);

		// 최종 통계 계산
		const totalAmount = operationStats.totalAmount;
		const managementFee = Math.round(totalAmount * 0.05); // 지입료 5%
		const deductedAmount = operationStats.deductedAmount;

		const result = {
			totalAmount,
			managementFee,
			deductedAmount,
			totalFuelCost: fuelStats.totalCost,
			totalRepairCost: repairStats.totalCost,
		};

		return result;
	}

	/**
	 * 날짜 문자열을 파싱하여 연/월/일 추출
	 * @param startDate 시작일 (YYYY-MM-DD)
	 * @param endDate 종료일 (YYYY-MM-DD)
	 */
	private parseDateRange(startDate: string, endDate: string) {
		const startDateObj = new Date(startDate);
		const endDateObj = new Date(endDate);

		return {
			startYear: startDateObj.getFullYear().toString(),
			startMonth: (startDateObj.getMonth() + 1).toString().padStart(2, "0"),
			startDay: startDateObj.getDate().toString().padStart(2, "0"),
			endYear: endDateObj.getFullYear().toString(),
			endMonth: (endDateObj.getMonth() + 1).toString().padStart(2, "0"),
			endDay: endDateObj.getDate().toString().padStart(2, "0"),
		};
	}

	/**
	 * 운행 매출 통계 조회 (데이터 이월 처리 포함)
	 * 컬렉션 구조: operations/{YYYY-MM}/records
	 * 인덱스: year(string) + month(string) + vehicleNumber + day(string)
	 */
	private async getOperationStatistics(
		vehicleNumber: string,
		startYear: string,
		startMonth: string,
		startDay: string,
		endYear: string,
		endMonth: string,
		endDay: string,
	): Promise<{ totalAmount: number; deductedAmount: number }> {
		// 조회해야 할 연월 목록 생성 (데이터 이월 처리 포함)
		const yearMonths = this.getYearMonthRangesWithNextMonth(
			startYear,
			startMonth,
			endYear,
			endMonth,
		);

		let totalAmount = 0;
		let deductedAmount = 0;

		// 각 연월별로 컬렉션 조회
		for (const { year, month } of yearMonths) {
			const collectionPath = `operations/${year}-${month}/records`;
			console.log(`🔍 컬렉션 조회: ${collectionPath}`);

			try {
				// Firebase 쿼리 (인덱스 활용)
				const operationQuery = query(
					collection(db, collectionPath),
					where("vehicleNumber", "==", vehicleNumber),
					where("year", "==", year),
					where("month", "==", month),
				);

				const snapshot = await getDocs(operationQuery);
				console.log(
					`📄 ${collectionPath}에서 ${snapshot.docs.length}개 문서 조회됨`,
				);

				// 클라이언트에서 day 범위 필터링
				for (const doc of snapshot.docs) {
					const data = doc.data() as OperationRecord;

					// ⚠️ 중요: 실제 날짜(year-month-day)가 범위에 포함되는지 확인
					// 이월된 데이터는 컬렉션은 다른 월에 있지만 실제 날짜는 조회 범위에 있어야 함
					if (
						this.isDayInRange(
							data.day,
							data.year,
							data.month,
							startYear,
							startMonth,
							startDay,
							endYear,
							endMonth,
							endDay,
						)
					) {
						// 운행 매출 계산: 단가 × 중량
						const operationAmount = data.columnQAmount * data.chargeableWeight;
						totalAmount += operationAmount;
						deductedAmount += data.columnOAmount;

						console.log(
							`💰 운행 기록: ${data.year}-${data.month}-${data.day}, 금액: ${operationAmount} (컬렉션: ${year}-${month})`,
						);
					}
				}
			} catch (error) {
				console.warn(
					`⚠️ ${collectionPath} 조회 실패 (데이터 없을 수 있음):`,
					error,
				);
				// 해당 월에 데이터가 없을 수 있으므로 계속 진행
			}
		}

		return { totalAmount, deductedAmount };
	}

	/**
	 * 유류비 통계 조회 (데이터 이월 처리 포함)
	 * 컬렉션: fuel
	 * 인덱스: vehicleNumber + year(string) + month(string) + day(string)
	 */
	private async getFuelStatistics(
		vehicleNumber: string,
		startYear: string,
		startMonth: string,
		startDay: string,
		endYear: string,
		endMonth: string,
		endDay: string,
	): Promise<{ totalCost: number }> {
		// 조회할 연월 목록 생성 (데이터 이월 처리 포함)
		const yearMonths = this.getYearMonthRangesWithNextMonth(
			startYear,
			startMonth,
			endYear,
			endMonth,
		);

		let totalCost = 0;

		// 월별로 조회하여 네트워크 호출 최소화
		for (const { year, month } of yearMonths) {
			try {
				const fuelQuery = query(
					collection(db, "fuel"),
					where("vehicleNumber", "==", vehicleNumber),
					where("year", "==", year),
					where("month", "==", month),
				);

				const snapshot = await getDocs(fuelQuery);

				// 클라이언트에서 day 범위 필터링
				for (const doc of snapshot.docs) {
					const data = doc.data() as FuelRecord;

					// ⚠️ 중요: 실제 날짜가 범위에 포함되는지 확인 (이월 데이터 고려)
					if (
						this.isDayInRange(
							data.day,
							data.year,
							data.month,
							startYear,
							startMonth,
							startDay,
							endYear,
							endMonth,
							endDay,
						)
					) {
						totalCost += data.totalFuelCost;
						console.log(
							`⛽ 유류비 기록: ${data.year}-${data.month}-${data.day}, 비용: ${data.totalFuelCost}`,
						);
					}
				}
			} catch (error) {
				console.warn(`⚠️ 유류비 조회 실패 (${year}-${month}):`, error);
				// 해당 월에 데이터가 없을 수 있으므로 계속 진행
			}
		}

		return { totalCost };
	}

	/**
	 * 정비비 통계 조회 (데이터 이월 처리 포함)
	 * 컬렉션: repair
	 * 인덱스: vehicleNumber + year(string) + month(string) + day(string)
	 */
	private async getRepairStatistics(
		vehicleNumber: string,
		startYear: string,
		startMonth: string,
		startDay: string,
		endYear: string,
		endMonth: string,
		endDay: string,
	): Promise<{ totalCost: number }> {
		// 조회할 연월 목록 생성 (데이터 이월 처리 포함)
		const yearMonths = this.getYearMonthRangesWithNextMonth(
			startYear,
			startMonth,
			endYear,
			endMonth,
		);
		console.log(
			`📅 조회할 연월 (이월 처리 포함): ${yearMonths.map((ym) => `${ym.year}-${ym.month}`).join(", ")}`,
		);

		let totalCost = 0;

		// 월별로 조회하여 네트워크 호출 최소화
		for (const { year, month } of yearMonths) {
			try {
				const repairQuery = query(
					collection(db, "repair"),
					where("vehicleNumber", "==", vehicleNumber),
					where("year", "==", year),
					where("month", "==", month),
				);

				const snapshot = await getDocs(repairQuery);
				console.log(
					`📄 repair 컬렉션에서 ${snapshot.docs.length}개 문서 조회됨 (${year}-${month})`,
				);

				// 클라이언트에서 day 범위 필터링
				for (const doc of snapshot.docs) {
					const data = doc.data() as RepairRecord;

					// ⚠️ 중요: 실제 날짜가 범위에 포함되는지 확인 (이월 데이터 고려)
					if (
						this.isDayInRange(
							data.day,
							data.year,
							data.month,
							startYear,
							startMonth,
							startDay,
							endYear,
							endMonth,
							endDay,
						)
					) {
						totalCost += data.repairCost;
						console.log(
							`🔧 정비비 기록: ${data.year}-${data.month}-${data.day}, 비용: ${data.repairCost}`,
						);
					}
				}
			} catch (error) {
				console.warn(`⚠️ 정비비 조회 실패 (${year}-${month}):`, error);
				// 해당 월에 데이터가 없을 수 있으므로 계속 진행
			}
		}

		return { totalCost };
	}

	/**
	 * 연월 범위 생성 (데이터 이월 처리 포함)
	 *
	 * ⚠️ 핵심 로직: 무조건 다음 달까지 조회하여 이월된 데이터 포함
	 *
	 * 데이터 이월은 언제든지 발생할 수 있으므로 (사용자 늦은 입력, 시스템 지연 등)
	 * 안전하게 마지막 월의 다음 달까지 항상 조회
	 *
	 * 예시:
	 * - 2025-01-01 ~ 2025-02-26 → [2025-01, 2025-02, 2025-03] (무조건 다음 달 포함)
	 * - 2025-01-31 ~ 2025-01-31 → [2025-01, 2025-02] (무조건 다음 달 포함)
	 *
	 * @param startYear 시작 연도
	 * @param startMonth 시작 월
	 * @param endYear 종료 연도
	 * @param endMonth 종료 월
	 */
	private getYearMonthRangesWithNextMonth(
		startYear: string,
		startMonth: string,
		endYear: string,
		endMonth: string,
	): Array<{ year: string; month: string }> {
		const ranges: Array<{ year: string; month: string }> = [];

		// 1. 기본 범위 생성 (startYear-startMonth ~ endYear-endMonth)
		const startDate = new Date(
			Number.parseInt(startYear),
			Number.parseInt(startMonth) - 1,
			1,
		);
		const endDate = new Date(
			Number.parseInt(endYear),
			Number.parseInt(endMonth) - 1,
			1,
		);
		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			const year = currentDate.getFullYear().toString();
			const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
			ranges.push({ year, month });

			// 다음 달로 이동
			currentDate.setMonth(currentDate.getMonth() + 1);
		}

		// 2. 데이터 이월 처리: 무조건 마지막 월의 다음 달 추가
		const lastMonth = new Date(
			Number.parseInt(endYear),
			Number.parseInt(endMonth) - 1,
			1,
		);
		lastMonth.setMonth(lastMonth.getMonth() + 1);

		const nextYear = lastMonth.getFullYear().toString();
		const nextMonth = (lastMonth.getMonth() + 1).toString().padStart(2, "0");

		// 중복 방지 체크
		const nextMonthKey = `${nextYear}-${nextMonth}`;
		const existingKeys = ranges.map((r) => `${r.year}-${r.month}`);

		if (!existingKeys.includes(nextMonthKey)) {
			ranges.push({ year: nextYear, month: nextMonth });
			console.log(`📅 데이터 이월 처리: ${nextMonthKey} 무조건 추가`);
		}

		return ranges;
	}

	/**
	 * 특정 day가 날짜 범위에 포함되는지 확인
	 *
	 * ⚠️ 중요: 데이터의 실제 날짜(year-month-day)를 기준으로 판단
	 * 컬렉션 위치와 관계없이 실제 날짜가 조회 범위에 있으면 포함
	 *
	 * @param day 확인할 일 (데이터의 실제 날짜)
	 * @param year 확인할 연도 (데이터의 실제 날짜)
	 * @param month 확인할 월 (데이터의 실제 날짜)
	 */
	private isDayInRange(
		day: string,
		year: string,
		month: string,
		startYear: string,
		startMonth: string,
		startDay: string,
		endYear: string,
		endMonth: string,
		endDay: string,
	): boolean {
		// 데이터의 실제 날짜
		const dataDate = new Date(
			Number.parseInt(year),
			Number.parseInt(month) - 1,
			Number.parseInt(day),
		);

		// 조회 범위
		const startDate = new Date(
			Number.parseInt(startYear),
			Number.parseInt(startMonth) - 1,
			Number.parseInt(startDay),
		);
		const endDate = new Date(
			Number.parseInt(endYear),
			Number.parseInt(endMonth) - 1,
			Number.parseInt(endDay),
		);

		const isInRange = dataDate >= startDate && dataDate <= endDate;

		return isInRange;
	}
}

export const statisticsByPeriodService = new StatisticsByPeriodService();

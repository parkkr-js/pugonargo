// src/features/statisticsByPeriod/usecases/statisticsByPeriodUsecases.ts

import { statisticsByPeriodService } from "../services/statisticsByPeriodService";
import type { PeriodStatistics } from "../types/statisticsByPeriod.interface";

class StatisticsByPeriodUsecases {
	/**
	 * 기간별 통계 데이터 조회
	 * @param vehicleNumber 차량번호
	 * @param startDate 시작일 (YYYY-MM-DD)
	 * @param endDate 종료일 (YYYY-MM-DD)
	 * @returns PeriodStatistics 통계 데이터
	 * @throws Error 유효하지 않은 입력값인 경우
	 */
	async getStatisticsByPeriod(
		vehicleNumber: string,
		startDate: string,
		endDate: string,
	): Promise<PeriodStatistics> {
		// 입력값 유효성 검증
		this.validateInputs(vehicleNumber, startDate, endDate);

		// 서비스 레이어 호출
		const statistics = await statisticsByPeriodService.getStatisticsByPeriod(
			vehicleNumber,
			startDate,
			endDate,
		);

		return statistics;
	}

	/**
	 * 기간 유효성 검증
	 * @param startDate 시작일 (YYYY-MM-DD)
	 * @param endDate 종료일 (YYYY-MM-DD)
	 * @returns boolean 유효한 기간인지 여부
	 */
	isValidPeriod(startDate: string, endDate: string): boolean {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const today = new Date();
		today.setHours(23, 59, 59, 999); // 오늘 날짜의 끝으로 설정

		// 날짜 형식이 유효한지 확인
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			return false;
		}

		// 시작일이 종료일보다 늦으면 안됨
		if (start > end) {
			return false;
		}

		// 미래 날짜는 선택 불가 (오늘 날짜의 끝까지는 허용)
		if (end > today) {
			return false;
		}

		return true;
	}

	/**
	 * 기간 텍스트 포맷팅
	 */
	formatPeriodText(startDate: string, endDate: string): string {
		const start = new Date(startDate);
		const end = new Date(endDate);

		const formatDate = (date: Date): string => {
			const year = date.getFullYear().toString().slice(2);
			const month = (date.getMonth() + 1).toString().padStart(2, "0");
			const day = date.getDate().toString().padStart(2, "0");
			return `${year}.${month}.${day}`;
		};

		const formattedStart = formatDate(start);
		const formattedEnd = formatDate(end);

		return startDate === endDate
			? formattedStart
			: `${formattedStart} - ${formattedEnd}`;
	}

	/**
	 * 입력값 유효성 검증
	 * @param vehicleNumber 차량번호
	 * @param startDate 시작일 (YYYY-MM-DD)
	 * @param endDate 종료일 (YYYY-MM-DD)
	 * @throws Error 유효하지 않은 입력값인 경우
	 */
	private validateInputs(
		vehicleNumber: string,
		startDate: string,
		endDate: string,
	): void {
		if (!vehicleNumber || vehicleNumber.trim() === "") {
			throw new Error("차량번호가 필요합니다.");
		}

		if (!this.isValidPeriod(startDate, endDate)) {
			throw new Error("유효하지 않은 기간입니다.");
		}
	}
}

export const statisticsByPeriodUsecases = new StatisticsByPeriodUsecases();

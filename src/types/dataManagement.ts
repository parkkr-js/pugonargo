export interface MonthlyStats {
	id: string; // yyyy-mm 형식
	recordCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface MonthlyStatsListItem {
	id: string;
	recordCount: number;
}

export type DriversDbSupplier =
	| "#1"
	| "#2"
	| "#3"
	| "#4"
	| "#5"
	| "#6"
	| "#7"
	| "#8"
	| "#9"
	| "#10";

export const DRIVERS_DB_SUPPLIERS: DriversDbSupplier[] = [
	"#1",
	"#2",
	"#3",
	"#4",
	"#5",
	"#6",
	"#7",
	"#8",
	"#9",
	"#10",
];

export interface Driver {
	id: string;
	userId: string; // 차량번호 + 매입처(driversDbSupplier)
	password: string; // 자동 생성된 비밀번호
	vehicleNumber: string; // 4자리 차량번호
	driversDbSupplier: DriversDbSupplier; // 매입처
	dumpWeight: number; // 소수점 가능한 덤프 중량
	createdAt: Date;
	updatedAt: Date;
}

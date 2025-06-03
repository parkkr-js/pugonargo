export type DriverGroup =
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

export const DRIVER_GROUPS: DriverGroup[] = [
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
	userId: string; // D + 차량번호
	password: string; // 자동 생성된 비밀번호
	vehicleNumber: string; // 4자리 차량번호
	group: DriverGroup;
	dumpWeight: number; // 소수점 가능한 덤프 중량
	createdAt: Date;
	updatedAt: Date;
}

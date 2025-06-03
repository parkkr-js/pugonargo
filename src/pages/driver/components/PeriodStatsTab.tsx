import { DatePicker, Empty, Spin } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { usePeriodStats } from "../hooks/usePeriodStats";
import { StatCard } from "./StatCard";

export function PeriodStatsTab() {
	const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs(), dayjs()]);
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const { data, isLoading, isError, error } = usePeriodStats(
		vehicleNumber,
		range[0].toDate(),
		range[1].toDate(),
	);

	console.log(
		"vehicleNumber",
		vehicleNumber,
		"range",
		range,
		"isLoading",
		isLoading,
		"isError",
		isError,
		error,
	);

	const disabledDate = (current: Dayjs) =>
		current && current > dayjs().endOf("day");

	return (
		<>
			<div style={{ padding: 16 }}>
				<DatePicker.RangePicker
					value={range}
					onChange={(val) => val && setRange(val as [Dayjs, Dayjs])}
					style={{ width: "100%" }}
					disabledDate={disabledDate}
					panelRender={(panel) => (
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							{panel}
						</div>
					)}
				/>
				<div style={{ marginTop: 16 }}>
					{isLoading ? (
						<Spin />
					) : isError ? (
						<Empty
							description={(error as Error)?.message || "데이터가 없습니다"}
						/>
					) : !data || Object.values(data).every((v) => !v) ? (
						<Empty description="데이터가 없습니다" />
					) : (
						<StatCard data={data} />
					)}
				</div>
			</div>
			{/* 모바일 세로 달력 스타일 */}
			<style>{`
				.ant-picker-dropdown .ant-picker-panels {
					display: flex !important;
					flex-direction: column !important;
				}
				.ant-picker-dropdown .ant-picker-panel-container {
					flex-direction: column !important;
				}
			`}</style>
		</>
	);
}

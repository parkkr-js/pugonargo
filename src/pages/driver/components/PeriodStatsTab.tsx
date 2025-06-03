import { DatePicker, Spin } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { usePeriodStats } from "../hooks/usePeriodStats";
import { StatCard } from "./StatCard";

export function PeriodStatsTab() {
	const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs(), dayjs()]);
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const { data, isLoading, isError } = usePeriodStats(
		vehicleNumber,
		range[0].toDate(),
		range[1].toDate(),
	);

	const disabledDate = (current: Dayjs) =>
		current && current > dayjs().endOf("day");

	const zeroData = {
		totalAmount: 0,
		totalDeduction: 0,
		afterDeduction: 0,
		totalFuelCost: 0,
		totalRepairCost: 0,
	};

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
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								minHeight: 200,
							}}
						>
							<Spin />
						</div>
					) : (
						<StatCard data={data && !isError ? data : zeroData} />
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

import { DatePicker, Spin } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import styled from "styled-components";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { useCurrentDriversDbSupplier } from "../hooks/useCurrentDriversDbSupplier";
import { usePeriodStats } from "../hooks/usePeriodStats";
import MobileCalendarStyle from "./MobileCalendarStyle";
import { StatCard } from "./StatCard";

export function PeriodStatsTab() {
	const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs(), dayjs()]);
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const driversDbSupplier = useCurrentDriversDbSupplier();

	const { data, isLoading, isError } = usePeriodStats(
		vehicleNumber,
		driversDbSupplier,
		range[0].toDate(),
		range[1].toDate(),
	);

	const disabledDate = (current: Dayjs) =>
		current && current > dayjs().endOf("day");

	const zeroData = {
		totalAmount: 0,
		totalDeduction: 0,
		totalFuelCost: 0,
		totalRepairCost: 0,
	};

	return (
		<Wrapper>
			<MobileCalendarStyle />
			<StyledRangePicker
				value={range}
				onChange={(val) => val && setRange(val as [Dayjs, Dayjs])}
				disabledDate={disabledDate}
				panelRender={(panel) => <PanelWrapper>{panel}</PanelWrapper>}
				size="large"
				inputReadOnly
				allowClear={false}
			/>
			<Content>
				{isLoading ? (
					<LoadingArea>
						<Spin />
					</LoadingArea>
				) : (
					<StatCard data={data && !isError ? data : zeroData} />
				)}
			</Content>
		</Wrapper>
	);
}

const Wrapper = styled.div`
	padding: 16px;
`;

const StyledRangePicker = styled(DatePicker.RangePicker)`
	width: 100%;
	.ant-picker-input > input {
		font-size: 16px;
	}
`;

const PanelWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const Content = styled.div`
	margin-top: 24px;
`;

const LoadingArea = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 200px;
`;

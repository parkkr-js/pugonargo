import { FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { DatePicker, Tooltip, message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { TransactionsTable } from "./components/TransactionsTable";

const { RangePicker } = DatePicker;
const MAX_RANGE = 90;

export function TransactionsPage() {
	const [range, setRange] = useState<[Dayjs, Dayjs]>([
		dayjs().startOf("month"),
		dayjs(),
	]);

	// 90일 초과 메시지가 이미 표시되었는지 추적
	const hasShownRangeMessage = useRef(false);

	const startDate = range[0].format("YYYY-MM-DD");
	const endDate = range[1].format("YYYY-MM-DD");

	// 오늘 이후 비활성화 - 메모이제이션으로 매번 새 함수 생성 방지
	const disabledDate = useCallback(
		(current: Dayjs) => current && current > dayjs().endOf("day"),
		[],
	);

	// 90일 초과 체크 및 메시지 표시 함수
	const checkAndShowRangeMessage = useCallback(
		(startDate: Dayjs, endDate: Dayjs) => {
			if (
				endDate.diff(startDate, "day") > MAX_RANGE &&
				!hasShownRangeMessage.current
			) {
				message.info("최대 90일까지 조회할 수 있습니다.");
				hasShownRangeMessage.current = true;
			}
		},
		[],
	);

	// 90일 초과 안내 (달력 변경 중)
	const handleCalendarChange = useCallback(
		(dates: (Dayjs | null)[] | null) => {
			if (dates?.[0] && dates?.[1]) {
				checkAndShowRangeMessage(dates[0], dates[1]);
			}
		},
		[checkAndShowRangeMessage],
	);

	const handleRangeChange = useCallback(
		(v: (Dayjs | null)[] | null) => {
			if (v?.[0] && v?.[1] && v[1].diff(v[0], "day") > MAX_RANGE) {
				checkAndShowRangeMessage(v[0], v[1]);
				return;
			}
			if (v?.[0] && v?.[1]) {
				setRange([v[0], v[1]]);
				hasShownRangeMessage.current = false;
			}
		},
		[checkAndShowRangeMessage],
	);

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<FileTextOutlined />
						거래 내역
					</MainTitle>
					<SubTitle>차량별 거래 내역을 관리하세요</SubTitle>
				</PageHeader>

				<DateRangeContainer>
					<RangePicker
						size="large"
						value={range}
						disabledDate={disabledDate}
						onCalendarChange={handleCalendarChange}
						onChange={handleRangeChange}
						allowClear={false}
					/>
					<Tooltip title="최대 90일까지 조회할 수 있습니다. 오늘 이후 날짜는 선택할 수 없습니다.">
						<InfoIcon />
					</Tooltip>
				</DateRangeContainer>

				<TransactionsTable startDate={startDate} endDate={endDate} />
			</VerticalStack>
		</AdminLayout>
	);
}

const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => gap ?? 24}px;
	width: 100%;
`;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 24px;
`;

const MainTitle = styled.h1`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	font-weight: 700;
	color: ${({ theme }) => theme.colors.primary};
	margin: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SubTitle = styled.span`
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.gray[600]};
	font-weight: 400;
`;

const DateRangeContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const InfoIcon = styled(InfoCircleOutlined)`
	color: ${({ theme }) => theme.colors.gray[500]};
	font-size: 20px;
	cursor: help;
`;

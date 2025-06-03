import { FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { DatePicker, Modal, Tooltip, Typography, message } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { type Summary, SummaryCards } from "./components/SummaryCards";
import {
	type TableRow,
	TransactionsTable,
} from "./components/TransactionsTable";
import { useDriversMap } from "./hooks/useDriversMap";
import { useTransactions } from "./hooks/useTransactions";

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MAX_RANGE = 90;

export function TransactionsPage() {
	const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
		dayjs().startOf("month"),
		dayjs(),
	]);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

	// 90일 초과 메시지가 이미 표시되었는지 추적
	const hasShownRangeMessage = useRef(false);

	const startDate = useMemo(() => range[0].format("YYYY-MM-DD"), [range]);
	const endDate = useMemo(() => range[1].format("YYYY-MM-DD"), [range]);

	const { data: driversMap = {}, isLoading: driversLoading } =
		useDriversMap() as {
			data: Record<string, { group: string; name: string }>;
			isLoading: boolean;
		};
	const { data: rows = [], isLoading: txLoading } = useTransactions(
		startDate,
		endDate,
	);

	type RawDataRow = {
		date: string;
		d: string;
		e: string;
		m: number;
		n: number;
		o: number;
		i: number;
		p: string;
		[key: string]: unknown;
	};
	const tableRows: TableRow[] = useMemo(
		() =>
			(rows as RawDataRow[]).map((row) => ({
				...row,
				group: driversMap[row.d]?.group || "-",
			})),
		[rows, driversMap],
	);

	// 합계 계산 ( i: 청구 o: 지급)
	const summary: Summary = useMemo(() => {
		const totalWithoutTax = Math.round(
			tableRows.reduce((sum, r) => sum + (Number(r.i) || 0), 0),
		);
		const totalWithTax = Math.round(totalWithoutTax * 1.1);
		const totalPaidWithoutTax = Math.round(
			tableRows.reduce((sum, r) => sum + (Number(r.o) || 0), 0),
		);
		const totalPaid = Math.round(totalPaidWithoutTax * 1.1);
		return {
			totalWithTax,
			totalWithoutTax,
			totalPaid,
			totalPaidWithoutTax,
		};
	}, [tableRows]);

	// 오늘 이후 비활성화 - 메모이제이션으로 매번 새 함수 생성 방지
	const disabledDate = useCallback(
		(current: dayjs.Dayjs) => current && current > dayjs().endOf("day"),
		[],
	);

	// 90일 초과 체크 및 메시지 표시 함수
	const checkAndShowRangeMessage = useCallback(
		(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
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
	const handleCalendarChange: React.ComponentProps<
		typeof RangePicker
	>["onCalendarChange"] = useCallback(
		(dates: (dayjs.Dayjs | null)[] | null) => {
			if (dates?.[0] && dates?.[1]) {
				checkAndShowRangeMessage(dates[0], dates[1]);
			}
		},
		[checkAndShowRangeMessage],
	);

	const handleRangeChange: React.ComponentProps<
		typeof RangePicker
	>["onChange"] = useCallback(
		(v: (dayjs.Dayjs | null)[] | null) => {
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

	const handleVehicleClick = useCallback((d: string) => {
		setSelectedVehicle(d);
		setModalOpen(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setModalOpen(false);
	}, []);

	return (
		<AdminLayout>
			<div>
				{/* 페이지 헤더 */}
				<div style={{ marginBottom: "24px" }}>
					<Title
						level={2}
						style={{
							margin: 0,
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<FileTextOutlined />
						거래 내역
					</Title>
					<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
						모든 거래 내역을 확인하고 관리하세요
					</Paragraph>
				</div>

				{/* 날짜 범위 선택 + 인포 아이콘 */}
				<div
					style={{
						marginBottom: 8,
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<RangePicker
						value={range}
						disabledDate={disabledDate}
						onCalendarChange={handleCalendarChange}
						onChange={handleRangeChange}
						allowClear={false}
						style={{ marginBottom: 16 }}
					/>
					<Tooltip title="최대 90일까지 조회할 수 있습니다. 오늘 이후 날짜는 선택할 수 없습니다.">
						<InfoCircleOutlined
							style={{
								color: "#8c8c8c",
								fontSize: "14px",
								marginBottom: 16,
								cursor: "help",
							}}
						/>
					</Tooltip>
				</div>

				{/* 통계 카드 */}
				<SummaryCards summary={summary} />

				{/* 거래 내역 테이블 */}
				<div style={{ marginBottom: "24px" }}>
					<TransactionsTable
						rows={tableRows}
						loading={driversLoading || txLoading}
						onVehicleClick={handleVehicleClick}
					/>
				</div>
			</div>
			<Modal open={modalOpen} onCancel={handleModalClose} footer={null}>
				<div>차량번호: {selectedVehicle}</div>
			</Modal>
		</AdminLayout>
	);
}

import { DatePicker, Form, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect } from "react";
import type { FuelRecordInput } from "../../../services/client/createFuelRecord";

interface FuelRecordModalProps {
	open: boolean;
	initialData?: FuelRecordInput;
	onOk: (data: FuelRecordInput) => void;
	onCancel: () => void;
	hideDateField?: boolean;
}

interface FuelRecordForm {
	date: string | Dayjs;
	unitPrice: number;
	fuelAmount: number;
}

export function FuelRecordModal({
	open,
	initialData,
	onOk,
	onCancel,
	vehicleNumber,
	hideDateField = false,
}: FuelRecordModalProps & { vehicleNumber: string }) {
	const [form] = Form.useForm<FuelRecordForm>();

	const unitPrice = Form.useWatch("unitPrice", form) ?? 0;
	const fuelAmount = Form.useWatch("fuelAmount", form) ?? 0;
	const totalFuelCost = unitPrice * fuelAmount;

	useEffect(() => {
		if (initialData) {
			form.setFieldsValue({ ...initialData, date: dayjs(initialData.date) });
		} else {
			form.resetFields();
		}
	}, [initialData, form]);

	return (
		<Modal
			open={open}
			onOk={() =>
				form.validateFields().then((values) =>
					onOk({
						...values,
						date: dayjs(values.date).format("YYYY-MM-DD"),
						totalFuelCost: values.unitPrice * values.fuelAmount,
						vehicleNumber,
					}),
				)
			}
			onCancel={onCancel}
			title={initialData ? "주유내역 수정" : "주유내역 추가"}
			okText={initialData ? "수정" : "추가"}
		>
			<Form form={form} layout="vertical">
				{!hideDateField && (
					<Form.Item name="date" label="날짜" rules={[{ required: true }]}>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
				)}
				<Form.Item name="unitPrice" label="단가" rules={[{ required: true }]}>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						placeholder="주유 단가(ℓ당 금액)를 입력하세요"
					/>
				</Form.Item>
				<Form.Item
					name="fuelAmount"
					label="주유량"
					rules={[{ required: true }]}
				>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						placeholder="주유량(ℓ)을 입력하세요"
					/>
				</Form.Item>
				<div style={{ fontWeight: 700, marginTop: 8, textAlign: "right" }}>
					총 주유비{" "}
					<span style={{ fontWeight: 900 }}>
						{totalFuelCost.toLocaleString()} 원
					</span>
				</div>
			</Form>
		</Modal>
	);
}

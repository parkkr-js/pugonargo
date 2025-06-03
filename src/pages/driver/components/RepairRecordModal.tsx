import { DatePicker, Form, Input, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect } from "react";
import type { RepairRecordInput } from "../../../services/client/createRepairRecord";

interface RepairRecordModalProps {
	open: boolean;
	initialData?: RepairRecordInput;
	onOk: (data: RepairRecordInput) => void;
	onCancel: () => void;
	hideDateField?: boolean;
}

interface RepairRecordForm {
	date: string | Dayjs;
	repairCost: number;
	memo: string;
}

export function RepairRecordModal({
	open,
	initialData,
	onOk,
	onCancel,
	vehicleNumber,
	hideDateField = false,
}: RepairRecordModalProps & { vehicleNumber: string }) {
	const [form] = Form.useForm<RepairRecordForm>();

	const repairCost = Form.useWatch("repairCost", form) ?? 0;

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
						vehicleNumber,
					}),
				)
			}
			onCancel={onCancel}
			title={initialData ? "수리내역 수정" : "수리내역 추가"}
			okText={initialData ? "수정" : "추가"}
		>
			<Form form={form} layout="vertical">
				{!hideDateField && (
					<Form.Item name="date" label="날짜" rules={[{ required: true }]}>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
				)}
				<Form.Item
					name="repairCost"
					label="정비 비용"
					rules={[{ required: true }]}
				>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						placeholder="정비 비용을 입력하세요"
					/>
				</Form.Item>
				<Form.Item name="memo" label="메모">
					<Input placeholder="정비 내용을 작성해주세요" />
				</Form.Item>
				<div style={{ fontWeight: 700, marginTop: 8, textAlign: "right" }}>
					정비 비용{" "}
					<span style={{ fontWeight: 900 }}>
						{repairCost.toLocaleString()} 원
					</span>
				</div>
			</Form>
		</Modal>
	);
}

import { Button, Form, Input, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect } from "react";
import styled from "styled-components";
import type { RepairRecordInput } from "../../../services/client/createRepairRecord";

interface RepairRecordModalProps {
	open: boolean;
	initialData?: RepairRecordInput;
	onOk: (data: RepairRecordInput) => void;
	onCancel: () => void;
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

	const handleCancel = () => {
		form.resetFields();
		onCancel();
	};

	return (
		<StyledModal
			open={open}
			title={initialData ? "수리내역 수정" : "수리내역 추가"}
			footer={
				<ModalFooter>
					<StyledButton onClick={handleCancel}>취소</StyledButton>
					<StyledButton
						type="primary"
						onClick={async () => {
							try {
								const values = await form.validateFields();
								const safeMemo =
									typeof values.memo === "string" ? values.memo : "";
								onOk({
									...values,
									date: dayjs(values.date).format("YYYY-MM-DD"),
									vehicleNumber,
									memo: safeMemo,
								});
								form.resetFields();
							} catch {}
						}}
					>
						{initialData ? "수정" : "추가"}
					</StyledButton>
				</ModalFooter>
			}
			onCancel={handleCancel}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					style={{ marginTop: 24 }}
					name="repairCost"
					label={<LabelText>정비 비용</LabelText>}
					rules={[{ required: true, message: "정비 비용을 입력해주세요" }]}
				>
					<StyledInputNumber min={0} placeholder="정비 비용을 입력하세요" />
				</Form.Item>
				<Form.Item name="memo" label={<LabelText>메모</LabelText>}>
					<StyledInput placeholder="정비 내용을 작성해주세요" />
				</Form.Item>
				<TotalCostRow>
					정비 비용{" "}
					<TotalCostValue>{repairCost.toLocaleString()} 원</TotalCostValue>
				</TotalCostRow>
			</Form>
		</StyledModal>
	);
}

const StyledModal = styled(Modal)`
	.ant-modal-content {
		border-radius: ${({ theme }) => theme.borderRadius.lg};
	}
`;

const LabelText = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const StyledInputNumber = styled(InputNumber)`
	width: 100%;
	font-size: ${({ theme }) => theme.fontSizes.lg};
	padding: 8px 12px;
`;

const StyledInput = styled(Input)`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	padding: 8px 12px;
`;

const TotalCostRow = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	margin-top: ${({ theme }) => theme.spacing.md};
	text-align: right;
	font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const TotalCostValue = styled.span`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	margin-left: ${({ theme }) => theme.spacing.xs};
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 ${({ theme }) => theme.spacing.md};
`;

const StyledButton = styled(Button)`
	min-width: 80px;
`;

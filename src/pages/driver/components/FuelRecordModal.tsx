import { Button, Form, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect } from "react";
import styled from "styled-components";
import type { FuelRecordInput } from "../../../services/client/createFuelRecord";

interface FuelRecordModalProps {
	open: boolean;
	initialData?: FuelRecordInput;
	onOk: (data: FuelRecordInput) => void;
	onCancel: () => void;
	vehicleNumber: string;
	driversDbSupplier: string;
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
	driversDbSupplier,
}: FuelRecordModalProps) {
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
		<StyledModal
			open={open}
			title={initialData ? "주유내역 수정" : "주유내역 추가"}
			footer={
				<ModalFooter>
					<StyledButton onClick={onCancel}>취소</StyledButton>
					<StyledButton
						type="primary"
						onClick={async () => {
							try {
								const values = await form.validateFields();
								onOk({
									...values,
									date: dayjs(values.date).format("YYYY-MM-DD"),
									totalFuelCost: values.unitPrice * values.fuelAmount,
									vehicleNumber,
									driversDbSupplier,
								});
							} catch {}
						}}
					>
						{initialData ? "수정" : "추가"}
					</StyledButton>
				</ModalFooter>
			}
			onCancel={onCancel}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					style={{ marginTop: 24 }}
					name="unitPrice"
					label={<LabelText>단가</LabelText>}
					rules={[{ required: true }]}
				>
					<StyledInputNumber
						min={0}
						placeholder="주유 단가(ℓ당 금액)를 입력하세요"
					/>
				</Form.Item>
				<Form.Item
					name="fuelAmount"
					label={<LabelText>주유량</LabelText>}
					rules={[{ required: true }]}
				>
					<StyledInputNumber min={0} placeholder="주유량(ℓ)을 입력하세요" />
				</Form.Item>
				<TotalCostRow>
					총 주유비{" "}
					<TotalCostValue>{totalFuelCost.toLocaleString()} 원</TotalCostValue>
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
	font-size: ${({ theme }) => theme.fontSizes.xl};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const StyledInputNumber = styled(InputNumber)`
	width: 100%;
	font-size: ${({ theme }) => theme.fontSizes.xl};
	padding: 8px 12px;
`;

const TotalCostRow = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	margin-top: ${({ theme }) => theme.spacing.md};
	text-align: right;
	font-size: ${({ theme }) => theme.fontSizes.xl};
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
	font-size: ${({ theme }) => theme.fontSizes.xl};
`;

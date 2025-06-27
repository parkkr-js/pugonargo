import { CopyOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, message } from "antd";
import { memo, useEffect, useState } from "react";
import type { Driver, DriversDbSupplier } from "../../../../types/driver";
import { DRIVERS_DB_SUPPLIERS } from "../../../../types/driver";
import {
	checkDuplicateDriver,
	generateDriverId,
	generateDriverPassword,
} from "../../../../utils/driverUtils";

interface DriverModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (
		data: Omit<Driver, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
	initialData?: Driver;
	existingDrivers: Driver[];
}

interface FormValues {
	vehicleNumber: string;
	driversDbSupplier: DriversDbSupplier;
	dumpWeight: number;
}

export const DriverModal = memo(
	({
		open,
		onClose,
		onSubmit,
		initialData,
		existingDrivers,
	}: DriverModalProps) => {
		const [form] = Form.useForm<FormValues>();
		const [generatedUserId, setGeneratedUserId] = useState<string>("");
		const [generatedPassword, setGeneratedPassword] = useState<string>("");

		/**
		 * 차량번호 변경 시 ID와 비밀번호 자동 생성
		 */
		const handleVehicleNumberChange = (
			e: React.ChangeEvent<HTMLInputElement>,
		) => {
			const vehicleNumber = e.target.value;
			const currentSupplier = form.getFieldValue("driversDbSupplier");

			if (vehicleNumber.length === 4 && currentSupplier) {
				const userId = generateDriverId(vehicleNumber, currentSupplier);
				const password = generateDriverPassword(vehicleNumber, currentSupplier);
				setGeneratedUserId(userId);
				setGeneratedPassword(password);
			} else {
				setGeneratedUserId("");
				setGeneratedPassword("");
			}
		};

		/**
		 * 매입처 변경 시 ID와 비밀번호 자동 생성
		 */
		const handleSupplierChange = (supplier: DriversDbSupplier) => {
			const currentVehicleNumber = form.getFieldValue("vehicleNumber");

			if (
				currentVehicleNumber &&
				currentVehicleNumber.length === 4 &&
				supplier
			) {
				const userId = generateDriverId(currentVehicleNumber, supplier);
				const password = generateDriverPassword(currentVehicleNumber, supplier);
				setGeneratedUserId(userId);
				setGeneratedPassword(password);
			} else {
				setGeneratedUserId("");
				setGeneratedPassword("");
			}
		};

		/**
		 * 초기 데이터 설정
		 */
		useEffect(() => {
			if (initialData) {
				form.setFieldsValue({
					vehicleNumber: initialData.vehicleNumber,
					driversDbSupplier: initialData.driversDbSupplier,
					dumpWeight: initialData.dumpWeight,
				});
				setGeneratedUserId(initialData.userId);
				setGeneratedPassword(initialData.password);
			} else {
				form.resetFields();
				setGeneratedUserId("");
				setGeneratedPassword("");
			}
		}, [form, initialData]);

		// 모달이 닫힐 때 form 초기화
		useEffect(() => {
			if (!open) {
				form.resetFields();
				setGeneratedUserId("");
				setGeneratedPassword("");
			}
		}, [open, form]);

		/**
		 * 폼 제출 처리
		 */
		const handleSubmit = async () => {
			try {
				const values = await form.validateFields();

				if (
					checkDuplicateDriver(
						values.vehicleNumber,
						values.driversDbSupplier,
						existingDrivers,
						initialData?.id,
					)
				) {
					message.error("이미 존재하는 차량번호와 매입처 조합입니다.");
					return;
				}

				await onSubmit({
					userId: generatedUserId,
					password: generatedPassword,
					vehicleNumber: values.vehicleNumber,
					driversDbSupplier: values.driversDbSupplier,
					dumpWeight: values.dumpWeight,
				});
				onClose();
			} catch (error) {
				console.error("Failed to submit form:", error);
				message.error("폼 제출 중 오류가 발생했습니다.");
			}
		};

		/**
		 * 클립보드에 복사
		 */
		const handleCopy = (text: string, label: string) => {
			navigator.clipboard.writeText(text);
			message.success(`${label}가 클립보드에 복사되었습니다.`);
		};

		return (
			<Modal
				title={initialData ? "정보 수정" : "기사님 추가"}
				open={open}
				onCancel={onClose}
				onOk={handleSubmit}
				okText={initialData ? "수정" : "추가"}
				cancelText="취소"
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						dumpWeight: 0,
					}}
				>
					<Form.Item
						label="차량번호"
						name="vehicleNumber"
						rules={[
							{ required: true, message: "차량번호를 입력해주세요." },
							{ len: 4, message: "차량번호는 4자리여야 합니다." },
						]}
					>
						<Input
							placeholder="4자리 차량번호"
							maxLength={4}
							onChange={handleVehicleNumberChange}
						/>
					</Form.Item>

					<Form.Item
						label="매입처"
						name="driversDbSupplier"
						rules={[
							{
								required: true,
								message:
									"매입처를 선택해주세요. 구글시트의 매입처와 동일하게 선택해야 합니다.",
							},
						]}
					>
						<Select
							placeholder="매입처를 선택하세요. 구글시트의 매입처와 동일하게 선택해야 합니다."
							style={{ width: "100%" }}
							onChange={handleSupplierChange}
						>
							{DRIVERS_DB_SUPPLIERS.map((driversDbSupplier) => (
								<Select.Option
									key={driversDbSupplier}
									value={driversDbSupplier}
								>
									{driversDbSupplier}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="덤프 중량(루베)"
						name="dumpWeight"
						rules={[{ required: true, message: "덤프 중량을 입력해주세요." }]}
					>
						<InputNumber
							min={0}
							step={0.1}
							precision={1}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{generatedUserId && (
						<Form.Item label="ID">
							<Input
								value={generatedUserId}
								readOnly
								suffix={
									<Button
										type="text"
										icon={<CopyOutlined />}
										onClick={() => handleCopy(generatedUserId, "ID")}
									/>
								}
							/>
						</Form.Item>
					)}

					{generatedPassword && (
						<Form.Item label="비밀번호">
							<Input
								value={generatedPassword}
								readOnly
								suffix={
									<Button
										type="text"
										icon={<CopyOutlined />}
										onClick={() => handleCopy(generatedPassword, "비밀번호")}
									/>
								}
							/>
						</Form.Item>
					)}
				</Form>
			</Modal>
		);
	},
);

DriverModal.displayName = "DriverModal";

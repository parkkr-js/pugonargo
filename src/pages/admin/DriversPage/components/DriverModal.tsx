import { CopyOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, message } from "antd";
import { memo, useEffect, useState } from "react";
import type { Driver, DriverGroup } from "../../../../types/driver";
import { DRIVER_GROUPS } from "../../../../types/driver";
import {
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
}

export const DriverModal = memo(
	({ open, onClose, onSubmit, initialData }: DriverModalProps) => {
		const [form] = Form.useForm();
		const [generatedUserId, setGeneratedUserId] = useState<string>("");
		const [generatedPassword, setGeneratedPassword] = useState<string>("");

		// 차량번호 변경 시 userId와 password 자동 생성
		const handleVehicleNumberChange = (
			e: React.ChangeEvent<HTMLInputElement>,
		) => {
			const vehicleNumber = e.target.value;
			if (vehicleNumber.length === 4) {
				const userId = generateDriverId(vehicleNumber);
				setGeneratedUserId(userId);
				const password = generateDriverPassword(vehicleNumber);
				setGeneratedPassword(password);
			} else {
				setGeneratedUserId("");
				setGeneratedPassword("");
			}
		};

		// 초기 데이터 설정
		useEffect(() => {
			if (initialData) {
				form.setFieldsValue({
					vehicleNumber: initialData.vehicleNumber,
					group: initialData.group,
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

		// 폼 제출
		const handleSubmit = async () => {
			try {
				const values = await form.validateFields();
				await onSubmit({
					userId: generatedUserId,
					password: generatedPassword,
					vehicleNumber: values.vehicleNumber,
					group: values.group,
					dumpWeight: values.dumpWeight,
				});
				onClose();
			} catch (error) {
				console.error("Failed to submit form:", error);
			}
		};

		// 클립보드에 복사
		const handleCopy = (text: string, label: string) => {
			navigator.clipboard.writeText(text);
			message.success(`${label}이(가) 클립보드에 복사되었습니다.`);
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
						group: "#1 ~ #10" as DriverGroup,
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
						label="그룹"
						name="group"
						rules={[{ required: true, message: "그룹을 선택해주세요." }]}
					>
						<Select>
							{DRIVER_GROUPS.map((group) => (
								<Select.Option key={group} value={group}>
									{group}
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

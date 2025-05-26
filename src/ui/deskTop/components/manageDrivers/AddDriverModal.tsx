// src/ui/deskTop/components/manageDrivers/AddDriverModal.tsx
import { UserAddOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Modal, Select, Typography } from "antd";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDrivers } from "../../../../features/drivers/presentation/hooks/useDrivers";
import { generatePassword, generateUserId } from "../../../../utils/password";

const { Text } = Typography;

interface AddDriverModalProps {
	visible: boolean;
	onCancel: () => void;
	onSuccess: () => void;
	onError: (message: string) => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
	visible,
	onCancel,
	onSuccess,
	onError,
}) => {
	const [form] = Form.useForm();
	const { isLoading, handleCreateDriver } = useDrivers();

	const [previewUserId, setPreviewUserId] = useState<string>("");
	const [previewPassword, setPreviewPassword] = useState<string>("");

	const vehicleNumber = Form.useWatch("vehicleNumber", form);

	useEffect(() => {
		if (vehicleNumber && /^\d{4}$/.test(vehicleNumber)) {
			setPreviewUserId(generateUserId(vehicleNumber));
			setPreviewPassword(generatePassword());
		} else {
			setPreviewUserId("");
			setPreviewPassword("");
		}
	}, [vehicleNumber]);

	const handleSubmit = useCallback(
		async (values: {
			vehicleNumber: string;
			group: string;
			dumpWeight: number;
		}) => {
			try {
				await handleCreateDriver(values);
				form.resetFields();
				setPreviewUserId("");
				setPreviewPassword("");
				onSuccess();
				onCancel();
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					!error.message.includes("Validation failed")
				) {
					onError(error.message || "기사 정보 수정에 실패했습니다.");
				}
			}
		},
		[handleCreateDriver, form, onCancel, onSuccess, onError],
	);

	const handleClose = useCallback(() => {
		form.resetFields();
		setPreviewUserId("");
		setPreviewPassword("");
		onCancel();
	}, [form, onCancel]);

	return (
		<Modal
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<UserAddOutlined />
					<span>기사님 추가</span>
				</div>
			}
			open={visible}
			onCancel={handleClose}
			footer={null}
			width={400}
		>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					label="차량번호"
					name="vehicleNumber"
					rules={[
						{ required: true, message: "차량번호를 입력해주세요" },
						{
							pattern: /^\d{4}$/,
							message: "차량번호는 4자리 숫자여야 합니다",
						},
					]}
				>
					<Input placeholder="4자리 차량번호를 입력하세요" maxLength={4} />
				</Form.Item>

				<Form.Item
					label="덤프중량(톤베)"
					name="dumpWeight"
					rules={[{ required: true, message: "덤프중량을 선택해주세요" }]}
				>
					<Select placeholder="덤프중량을 선택하세요">
						<Select.Option value={17}>17톤</Select.Option>
						<Select.Option value={18}>18톤</Select.Option>
						<Select.Option value={19}>19톤</Select.Option>
						<Select.Option value={20}>20톤</Select.Option>
						<Select.Option value={21}>21톤</Select.Option>
						<Select.Option value={22}>22톤</Select.Option>
					</Select>
				</Form.Item>

				<Form.Item
					label="그룹"
					name="group"
					rules={[{ required: true, message: "그룹을 선택해주세요" }]}
				>
					<Select placeholder="그룹을 선택하세요">
						<Select.Option value={"#1"}>#1</Select.Option>
						<Select.Option value={"#2"}>#2</Select.Option>
						<Select.Option value={"#3"}>#3</Select.Option>
						<Select.Option value={"#4"}>#4</Select.Option>
						<Select.Option value={"#5"}>#5</Select.Option>
						<Select.Option value={"#6"}>#6</Select.Option>
						<Select.Option value={"#7"}>#7</Select.Option>
						<Select.Option value={"#8"}>#8</Select.Option>
						<Select.Option value={"#9"}>#9</Select.Option>
						<Select.Option value={"#10"}>#10</Select.Option>
					</Select>
				</Form.Item>

				<Divider />

				<div style={{ marginBottom: 16 }}>
					<Text strong>기사님 계정정보</Text>
				</div>

				<div
					style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
				>
					<Text style={{ marginRight: 8, fontWeight: 500 }}>ID:</Text>
					<Text
						copyable={{ text: previewUserId }}
						style={{ flex: 1, color: previewUserId ? undefined : "#a0a0a0" }}
					>
						{previewUserId || "차량번호 입력 시 생성"}
					</Text>
				</div>

				<div
					style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
				>
					<Text style={{ marginRight: 8, fontWeight: 500 }}>PW:</Text>
					<Text
						copyable={{ text: previewPassword }}
						style={{ flex: 1, color: previewPassword ? undefined : "#a0a0a0" }}
					>
						{previewPassword || "차량번호 입력 시 생성"}
					</Text>
				</div>

				<Divider />

				<div style={{ display: "flex", gap: 8, marginTop: 24 }}>
					<Button
						type="primary"
						htmlType="submit"
						loading={isLoading}
						style={{ flex: 1, backgroundColor: "#000d33" }}
						size="large"
					>
						저장하기
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

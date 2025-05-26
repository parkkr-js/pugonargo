// src/ui/deskTop/components/manageDrivers/EditDriverModal.tsx
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
	Button,
	Divider,
	Form,
	Input,
	Modal,
	Popconfirm,
	Select,
	Typography,
} from "antd";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { Driver } from "../../../../features/drivers/domain/entities/Driver";
import { useDrivers } from "../../../../features/drivers/presentation/hooks/useDrivers";
import { generatePassword, generateUserId } from "../../../../utils/password";

const { Text } = Typography;

interface EditDriverModalProps {
	visible: boolean;
	driver: Driver | null;
	onCancel: () => void;
	onUpdateSuccess: () => void;
	onDeleteSuccess: () => void;
	onError: (message: string) => void;
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({
	visible,
	driver,
	onCancel,
	onUpdateSuccess,
	onDeleteSuccess,
	onError,
}) => {
	const [form] = Form.useForm();
	const { isLoading, handleUpdateDriver, handleDeleteDriver } = useDrivers();
	const [previewUserId, setPreviewUserId] = useState<string>("");
	const [previewPassword, setPreviewPassword] = useState<string>("");

	useEffect(() => {
		if (driver && visible) {
			form.setFieldsValue({
				vehicleNumber: driver.vehicleNumber,
				group: driver.group,
				dumpWeight: driver.dumpWeight,
				userId: driver.userId,
				password: driver.password,
			});
			setPreviewUserId(driver.userId);
			setPreviewPassword(driver.password);
		}
	}, [driver, visible, form]);

	const vehicleNumber = Form.useWatch("vehicleNumber", form);

	useEffect(() => {
		if (
			vehicleNumber !== undefined &&
			vehicleNumber !== driver?.vehicleNumber &&
			/^\d{4}$/.test(vehicleNumber)
		) {
			setPreviewUserId(generateUserId(vehicleNumber));
			setPreviewPassword(generatePassword());
		} else if (driver && vehicleNumber === driver.vehicleNumber) {
			setPreviewUserId(driver.userId);
			setPreviewPassword(driver.password);
		} else if (vehicleNumber === "") {
			setPreviewUserId("");
			setPreviewPassword("");
		}
	}, [vehicleNumber, driver]);

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields();
			await handleUpdateDriver({
				id: driver?.id,
				...values,
			});

			onCancel();
			onUpdateSuccess();
		} catch (error: unknown) {
			if (
				error instanceof Error &&
				!error.message.includes("Validation failed")
			) {
				onError(error.message || "기사 정보 수정에 실패했습니다.");
			}
		}
	}, [driver, handleUpdateDriver, onCancel, onUpdateSuccess, onError, form]);

	const handleDelete = useCallback(async () => {
		if (!driver) return;

		try {
			await handleDeleteDriver(driver.id);

			onCancel();
			onDeleteSuccess();
		} catch (error: unknown) {
			if (error instanceof Error) {
				onError(error.message || "기사 삭제에 실패했습니다.");
			}
		}
	}, [driver, handleDeleteDriver, onCancel, onDeleteSuccess, onError]);

	return (
		<Modal
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<EditOutlined />
					<span>기사님 정보 관리</span>
				</div>
			}
			open={visible}
			onCancel={onCancel}
			footer={null}
			width={400}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label="차량번호"
					name="vehicleNumber"
					rules={[
						{ required: true, message: "차량번호를 입력해주세요" },
						{ pattern: /^\d{4}$/, message: "4자리 숫자를 입력해주세요" },
					]}
				>
					<Input placeholder={driver?.vehicleNumber} maxLength={4} />
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
					<Text strong>
						기사님 계정정보{" "}
						{vehicleNumber !== driver?.vehicleNumber ? "(수정 후)" : ""}
					</Text>
				</div>

				<div
					style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
				>
					<Text style={{ marginRight: 8, fontWeight: 500 }}>ID:</Text>
					<Text copyable={{ text: previewUserId }} style={{ flex: 1 }}>
						{previewUserId || "-"}
					</Text>
				</div>

				<div
					style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
				>
					<Text style={{ marginRight: 8, fontWeight: 500 }}>PW:</Text>
					<Text copyable={{ text: previewPassword }} style={{ flex: 1 }}>
						{previewPassword || "-"}
					</Text>
				</div>

				<Divider />

				<div style={{ display: "flex", gap: 8, marginTop: 24 }}>
					<Button
						type="primary"
						onClick={handleSubmit}
						loading={isLoading}
						style={{ flex: 1, backgroundColor: "#000d33" }}
						size="large"
						icon={<EditOutlined />}
					>
						수정하기
					</Button>

					<Popconfirm
						title="기사 삭제"
						description={
							<div>
								<div style={{ fontWeight: 500, marginBottom: 4 }}>
									정말로 이 기사를 삭제하시겠습니까?
								</div>
								<div style={{ fontSize: 12, color: "#666" }}>
									• 차량번호: {driver?.vehicleNumber}
									<br />• 사용자 ID: {driver?.userId}
									<br />• 삭제된 데이터는 복구할 수 없습니다.
								</div>
							</div>
						}
						onConfirm={handleDelete}
						okText="삭제하기"
						cancelText="취소"
						okType="danger"
						placement="top"
					>
						<Button
							danger
							size="large"
							icon={<DeleteOutlined />}
							loading={isLoading}
							style={{
								borderColor: "#ff4d4f",
								color: "#ff4d4f",
							}}
						>
							삭제
						</Button>
					</Popconfirm>
				</div>
			</Form>
		</Modal>
	);
};

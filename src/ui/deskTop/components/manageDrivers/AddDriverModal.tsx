// src/ui/deskTop/components/manageDrivers/AddDriverModal.tsx (수정된 버전)
import { Button, Form, Input, Modal, Select, Space, Typography } from "antd";
import type React from "react";
import { useCallback, useState } from "react";
import { useDrivers } from "../../../../features/drivers/presentation/hooks/useDrivers";

const { Text, Title } = Typography;

interface AddDriverModalProps {
	visible: boolean;
	onCancel: () => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
	visible,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const {
		isLoading,
		lastCreatedPassword,
		handleCreateDriver,
		handleClearLastPassword,
	} = useDrivers();

	const [showPassword, setShowPassword] = useState(false);
	const [createdVehicleNumber, setCreatedVehicleNumber] = useState<string>("");

	const handleSubmit = useCallback(
		async (values: {
			vehicleNumber: string;
			groupNumber: number;
			dumpWeight: number;
		}) => {
			const success = await handleCreateDriver(values);
			if (success) {
				// 🔥 form.resetFields() 호출 전에 차량번호 저장
				setCreatedVehicleNumber(values.vehicleNumber);
				setShowPassword(true);
				form.resetFields();
			}
		},
		[handleCreateDriver, form],
	);

	const handleClose = useCallback(() => {
		form.resetFields();
		setShowPassword(false);
		setCreatedVehicleNumber("");
		handleClearLastPassword();
		onCancel();
	}, [form, handleClearLastPassword, onCancel]);

	return (
		<Modal
			title="사용자 관리"
			open={visible}
			onCancel={handleClose}
			footer={null}
			width={400}
			destroyOnClose // 🔥 모달이 완전히 제거되도록
		>
			{!showPassword ? (
				<>
					<div style={{ marginBottom: 16 }}>
						<Text strong>기본정보</Text>
					</div>

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
							<Input
								placeholder="1255"
								maxLength={4}
								style={{ fontSize: "16px" }}
							/>
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
							label="그룹번호"
							name="groupNumber"
							rules={[{ required: true, message: "그룹번호를 선택해주세요" }]}
						>
							<Select placeholder="그룹번호를 선택하세요">
								<Select.Option value={1}>#1그룹</Select.Option>
								<Select.Option value={2}>#2그룹</Select.Option>
								<Select.Option value={3}>#3그룹</Select.Option>
								<Select.Option value={4}>#4그룹</Select.Option>
								<Select.Option value={5}>#5그룹</Select.Option>
								<Select.Option value={6}>#6그룹</Select.Option>
								<Select.Option value={7}>#7그룹</Select.Option>
								<Select.Option value={8}>#8그룹</Select.Option>
							</Select>
						</Form.Item>

						<div style={{ display: "flex", gap: 8, marginTop: 24 }}>
							<Button onClick={handleClose}>취소하기</Button>
							<Button
								type="primary"
								htmlType="submit"
								loading={isLoading}
								style={{ flex: 1 }}
							>
								저장하기
							</Button>
						</div>
					</Form>
				</>
			) : (
				<div style={{ textAlign: "center", padding: 20 }}>
					<div style={{ marginBottom: 16 }}>
						<Title level={4} style={{ color: "#52c41a", marginBottom: 8 }}>
							기사님 계정이 생성되었습니다!
						</Title>
					</div>

					<div
						style={{
							margin: "20px 0",
							padding: 20,
							backgroundColor: "#f6ffed",
							border: "1px solid #b7eb8f",
							borderRadius: 8,
						}}
					>
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<Text strong style={{ fontSize: 16 }}>
								🎯 생성된 로그인 정보
							</Text>

							<div
								style={{
									padding: 12,
									backgroundColor: "#fff",
									borderRadius: 6,
									border: "1px dashed #91d5ff",
								}}
							>
								<Space direction="vertical" size="small">
									<div>
										<Text type="secondary">로그인 ID:</Text>
										<br />
										<Text
											copyable
											strong
											style={{ fontSize: 18, color: "#1890ff" }}
										>
											D{createdVehicleNumber}
										</Text>
									</div>

									<div>
										<Text type="secondary">임시 비밀번호:</Text>
										<br />
										<Text
											copyable
											strong
											style={{ fontSize: 18, color: "#f5222d" }}
										>
											{lastCreatedPassword}
										</Text>
									</div>
								</Space>
							</div>
						</Space>
					</div>

					<div
						style={{
							padding: 12,
							backgroundColor: "#fff2e8",
							borderRadius: 6,
							marginBottom: 16,
						}}
					>
						<Text type="warning" style={{ fontSize: 12 }}>
							⚠️ <strong>중요:</strong> 이 정보를 기사님에게 전달해주세요.
							<br />
							창을 닫으면 비밀번호를 다시 확인할 수 없습니다.
						</Text>
					</div>

					<Button
						type="primary"
						size="large"
						onClick={handleClose}
						style={{ width: "100%" }}
					>
						확인 완료
					</Button>
				</div>
			)}
		</Modal>
	);
};

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
	Button,
	Divider,
	Form,
	Modal,
	Popconfirm,
	Select,
	Typography,
} from "antd";
import type React from "react";
import { useCallback, useEffect } from "react";
import type { Driver } from "../../../../features/drivers/domain/entities/Driver";
import { useDrivers } from "../../../../features/drivers/presentation/hooks/useDrivers";

const { Text } = Typography;

interface EditDriverModalProps {
	visible: boolean;
	driver: Driver | null;
	onCancel: () => void;
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({
	visible,
	driver,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const { isLoading, handleUpdateDriver, handleDeleteDriver } = useDrivers();

	useEffect(() => {
		if (driver && visible) {
			form.setFieldsValue({
				groupNumber: driver.groupNumber,
				dumpWeight: driver.dumpWeight,
			});
		}
	}, [driver, visible, form]);

	const handleSubmit = useCallback(
		async (values: {
			groupNumber: number;
			dumpWeight: number;
		}) => {
			if (!driver) return;

			const success = await handleUpdateDriver({
				id: driver.id,
				groupNumber: values.groupNumber,
				dumpWeight: values.dumpWeight,
			});

			if (success) {
				onCancel();
			}
		},
		[driver, handleUpdateDriver, onCancel],
	);

	const handleDelete = useCallback(async () => {
		if (!driver) return;

		const success = await handleDeleteDriver(driver.id);
		if (success) {
			onCancel();
		}
	}, [driver, handleDeleteDriver, onCancel]);

	return (
		<Modal
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<EditOutlined />
					<span>기사 정보 관리</span>
				</div>
			}
			open={visible}
			onCancel={onCancel}
			footer={null}
			width={480}
			destroyOnClose
		>
			<div style={{ marginBottom: 16 }}>
				<Text strong>기본정보 수정</Text>
				<Text
					type="secondary"
					style={{ display: "block", fontSize: 12, marginTop: 4 }}
				>
					※ 차량번호는 생성 후 변경할 수 없습니다
				</Text>
			</div>

			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				{/* 차량번호는 읽기 전용으로 표시 */}
				<Form.Item label="차량번호 (수정불가)">
					<div
						style={{
							padding: "12px 16px",
							backgroundColor: "#f8f9fa",
							border: "1px solid #e9ecef",
							borderRadius: "8px",
							color: "#495057",
							fontWeight: 500,
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<span>차량번호: {driver?.vehicleNumber}</span>
							<span style={{ color: "#6c757d" }}>ID: {driver?.userId}</span>
						</div>
					</div>
				</Form.Item>

				<Form.Item
					label="덤프중량(톤베)"
					name="dumpWeight"
					rules={[{ required: true, message: "덤프중량을 선택해주세요" }]}
				>
					<Select placeholder="덤프중량을 선택하세요" size="large">
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
					<Select placeholder="그룹번호를 선택하세요" size="large">
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

				<Divider />

				{/* 액션 버튼들 */}
				<div style={{ display: "flex", gap: 8, marginTop: 24 }}>
					<Button onClick={onCancel} size="large">
						취소하기
					</Button>

					<Button
						type="primary"
						htmlType="submit"
						loading={isLoading}
						style={{ flex: 1 }}
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

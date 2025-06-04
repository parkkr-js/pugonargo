import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUnifiedLogin } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import type { UnifiedLoginRequest } from "../../types/auth";

const { Title } = Typography;

export const LoginPage = () => {
	const { isAuthenticated, isLoading, user } = useAuthStore();
	const unifiedLogin = useUnifiedLogin();
	const [form] = Form.useForm();
	const [isFormValid, setIsFormValid] = useState(false);

	// 이미 로그인된 경우 역할에 따라 리다이렉트
	if (isAuthenticated && user) {
		const redirectPath = user.role === "admin" ? "/dashboard" : "/driver";
		return <Navigate to={redirectPath} replace />;
	}

	// 통합 로그인 처리
	const handleLogin = async (values: UnifiedLoginRequest) => {
		try {
			await unifiedLogin.mutateAsync(values);
		} catch (error) {
			console.error(error);
		}
	};

	const handleValuesChange = () => {
		const values = form.getFieldsValue();
		setIsFormValid(!!values.username && !!values.password);
	};

	return (
		<Card
			style={{
				width: 400,
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
			}}
		>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<Title level={2} style={{ textAlign: "center" }}>
					푸고나르고(P&N)
				</Title>

				<Form
					form={form}
					name="unified-login"
					onFinish={handleLogin}
					layout="vertical"
					size="large"
					onValuesChange={handleValuesChange}
				>
					<Form.Item
						name="username"
						rules={[{ required: true, message: "아이디를 입력해주세요" }]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder="아이디를 입력해주세요"
							disabled={isLoading}
						/>
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder="비밀번호를 입력해주세요"
							disabled={isLoading}
						/>
					</Form.Item>

					{unifiedLogin.isError && (
						<Alert
							message={
								unifiedLogin.error instanceof Error
									? unifiedLogin.error.message
									: "로그인에 실패했습니다"
							}
							type="error"
							showIcon
						/>
					)}

					<Form.Item style={{ marginTop: 48 }}>
						<Button
							type="primary"
							htmlType="submit"
							loading={isLoading}
							block
							style={{
								backgroundColor: isFormValid ? "#1E266F" : "#BEBEBE",
								borderColor: isFormValid ? "#1E266F" : "#BEBEBE",
							}}
						>
							로그인
						</Button>
					</Form.Item>
				</Form>
			</Space>
		</Card>
	);
};

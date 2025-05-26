import { App, Button, Form, Input } from "antd";
import { useCallback } from "react";
import type { LoginCredentials } from "../../features/auth/domain/entities/AuthTypes";
import { useAuth } from "../../features/auth/presentation/hooks/useAuth";

export const LoginForm = () => {
	const { login, isLoading } = useAuth();
	const { message } = App.useApp();

	const handleSubmit = useCallback(
		async (values: LoginCredentials) => {
			try {
				await login(values);
			} catch (error) {
				console.error("LoginForm: Login error:", error);
				message.error({
					content:
						error instanceof Error ? error.message : "로그인에 실패했습니다.",
					duration: 3,
				});
			}
		},
		[login, message],
	);

	return (
		<div style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}>
			<h1 style={{ textAlign: "center", marginBottom: "2rem" }}>로그인</h1>
			<Form
				name="login"
				onFinish={handleSubmit}
				autoComplete="off"
				layout="vertical"
			>
				<Form.Item
					label="아이디"
					name="email"
					rules={[{ required: true, message: "아이디를 입력해주세요." }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label="비밀번호"
					name="password"
					rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={isLoading} block>
						로그인
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

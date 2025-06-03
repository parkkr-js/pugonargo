import { Button, Result } from "antd";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { withAuth } from "./withAuth";

// 관리자 권한이 필요한 컴포넌트를 감싸는 HOC
export function withAdminAuth<P extends object>(
	WrappedComponent: ComponentType<P>,
): ComponentType<P> {
	return withAuth(function AdminComponent(props: P) {
		const { user, isAdmin } = useAuthStore();
		const navigate = useNavigate();

		// 관리자가 아닌 경우
		if (!isAdmin()) {
			const handleRedirect = () => {
				const redirectPath = user?.role === "driver" ? "/driver" : "/login";
				navigate(redirectPath);
			};

			return (
				<Result
					status="403"
					title="접근 권한이 없습니다"
					subTitle={`죄송합니다. ${user?.role === "driver" ? "기사" : "사용자"}님은 관리자 페이지에 접근할 권한이 없습니다.`}
					extra={
						<Button type="primary" onClick={handleRedirect}>
							{user?.role === "driver"
								? "기사 페이지로 이동"
								: "로그인 페이지로 이동"}
						</Button>
					}
				/>
			);
		}

		// 관리자인 경우 원래 컴포넌트 렌더링
		return <WrappedComponent {...props} />;
	});
}

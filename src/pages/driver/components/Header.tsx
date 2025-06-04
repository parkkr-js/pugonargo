import { Button, Typography } from "antd";
import { useCallback } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../stores/authStore";
import { useDriverStore } from "../../../stores/driverStore";

const { Title } = Typography;

export function Header() {
	const setVehicleNumber = useDriverStore((s) => s.setVehicleNumber);

	const handleLogout = useCallback(() => {
		setVehicleNumber("");
		useAuthStore.getState().logout();
		window.location.href = "/login";
	}, [setVehicleNumber]);

	return (
		<HeaderContainer>
			<StyledTitle level={5}>푸고나르고 (P&N)</StyledTitle>
			<StyledButton type="primary" onClick={handleLogout}>
				로그아웃
			</StyledButton>
		</HeaderContainer>
	);
}

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #eee;
`;

const StyledTitle = styled(Title)`
  && {
    margin: 0;
    color: #1e266f;
  }
`;

const StyledButton = styled(Button)`
  && {
    background: #1e266f;
    border-color: #1e266f;
  }
`;

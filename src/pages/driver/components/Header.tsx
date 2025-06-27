import { Button, Typography } from "antd";
import { useCallback } from "react";
import styled from "styled-components";
import { useLogout } from "../../auth/useAuth";
import { useCurrentDriverVehicleNumber } from "../hooks/useCurrentDriverVehicleNumber";
import { useCurrentDriversDbSupplier } from "../hooks/useCurrentDriversDbSupplier";

const { Title } = Typography;

export function Header() {
	const vehicleNumber = useCurrentDriverVehicleNumber();
	const driversDbSupplier = useCurrentDriversDbSupplier();
	const logout = useLogout();

	const handleLogout = useCallback(async () => {
		await logout.mutateAsync();
		window.location.href = "/login";
	}, [logout]);

	return (
		<HeaderContainer>
			<StyledTitle level={4}>
				{vehicleNumber} {driversDbSupplier} 기사님
			</StyledTitle>
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
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

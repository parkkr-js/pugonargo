import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import styled from "styled-components";

interface AuthAlertProps {
	onAuth: () => void;
}

export const AuthAlert = ({ onAuth }: AuthAlertProps) => (
	<AlertContainer>
		<Alert
			message="Google 계정 연동 필요"
			description="배차 데이터를 읽기 위해 Google 계정 연동이 필요합니다."
			type="info"
			showIcon
			action={
				<Button
					size="small"
					type="primary"
					icon={<GoogleOutlined />}
					onClick={onAuth}
				>
					Google 계정 연동
				</Button>
			}
		/>
	</AlertContainer>
);

const AlertContainer = styled.div`
	margin-bottom: 24px;
`;

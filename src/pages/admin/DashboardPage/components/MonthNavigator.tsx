import {
	CalendarOutlined,
	LeftOutlined,
	LoadingOutlined,
	RightOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";
import styled from "styled-components";
import { useMonthList } from "../hooks/useMonthList";

interface MonthNavigatorProps {
	monthId: string;
	setMonthId: (id: string) => void;
}

export function MonthNavigator({ monthId, setMonthId }: MonthNavigatorProps) {
	const { data: months = [], isLoading, error } = useMonthList();

	const idx = months.indexOf(monthId);
	const prev = months[idx - 1];
	const next = months[idx + 1];

	if (isLoading)
		return (
			<NavigatorWrapper>
				<LoadingContainer>
					<Spin
						indicator={
							<LoadingOutlined style={{ fontSize: 20, color: "#1890ff" }} />
						}
						size="large"
					/>
					<LoadingText>월 목록을 불러오고 있습니다...</LoadingText>
				</LoadingContainer>
			</NavigatorWrapper>
		);

	if (error || months.length === 0)
		return (
			<NavigatorWrapper>
				<ErrorContainer>
					<CalendarOutlined
						style={{ fontSize: 20, color: "#d9d9d9", marginBottom: 8 }}
					/>
					<ErrorText>월 데이터를 불러올 수 없습니다</ErrorText>
				</ErrorContainer>
			</NavigatorWrapper>
		);

	return (
		<NavigatorWrapper>
			<StyledButton
				icon={<LeftOutlined style={{ fontSize: 28 }} />}
				onClick={() => prev && setMonthId(prev)}
				disabled={!prev}
				$disabled={!prev}
				size="large"
			/>
			<MonthText>{monthId.replace("-", ". ")}월</MonthText>
			<StyledButton
				icon={<RightOutlined style={{ fontSize: 28 }} />}
				onClick={() => next && setMonthId(next)}
				disabled={!next}
				$disabled={!next}
				size="large"
			/>
		</NavigatorWrapper>
	);
}

const NavigatorWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 12px;
	margin: 0 !important;
	padding: 0 !important;
`;

const StyledButton = styled(Button)<{ $disabled?: boolean }>`
	background: transparent !important;
	border: none !important;
	padding: 0 !important;
	margin: 0 !important;
	box-shadow: none !important;
	display: flex;
	align-items: center;
	justify-content: center;

	& .anticon {
		color: ${({ $disabled }) => ($disabled ? "#d9d9d9" : "#666")};
	}

	&:hover:not(:disabled) {
		background: transparent !important;
		transform: scale(1.05);

		.anticon {
			color: ${({ theme }) => theme.colors.primary};
		}
	}

	&:active:not(:disabled) {
		transform: scale(0.95);
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

const MonthText = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xl};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	text-align: center;
	display: inline-block;
	color: black;
`;

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 20px;
`;

const LoadingText = styled.span`
	font-size: 14px;
	color: #8c8c8c;
	font-weight: 500;
`;

const ErrorContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 20px;
	background: #fafafa;
	border-radius: 8px;
	border: 1px dashed #d9d9d9;
`;

const ErrorText = styled.span`
	font-size: 14px;
	color: #8c8c8c;
	font-weight: 500;
`;

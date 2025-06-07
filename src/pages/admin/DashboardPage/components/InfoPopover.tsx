import { InfoCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import styled from "styled-components";

interface InfoPopoverProps {
	placement?: "top" | "right" | "bottom" | "left";
}

const INFO_LIST = [
	"총 청구금액 (부가세 포함) - I13 * 1.1",
	"총 청구금액 (공급가) - I13",
	"총 지급금액  - O13 * 1.1",
	"총 지급금액(공급가) - O13",
];

export const InfoPopover = ({ placement = "right" }: InfoPopoverProps) => (
	<Popover
		content={
			<PopoverContent>
				<div>각 금액은 연동된 구글시트의 특정 셀에서 불러온 값입니다.</div>
				<InfoList>
					{INFO_LIST.map((item) => (
						<li key={item}>{item}</li>
					))}
				</InfoList>
			</PopoverContent>
		}
		placement={placement}
		trigger="hover"
		overlayInnerStyle={{
			padding: 0,
		}}
	>
		<StyledInfoIcon />
	</Popover>
);

const PopoverContent = styled.div`
	background-color: rgba(255, 255, 255, 0.85);
	border-radius: 8px;
	color: ${({ theme }) => theme.colors.gray[500] || "#8c8c8c"};
	font-size: 12px;
	white-space: normal;
	padding: 12px 16px;
`;

const InfoList = styled.ul`
	margin: 8px 0 0 0;
	padding-left: 18px;
	list-style: disc;
	color: inherit;
	font-size: inherit;
`;

const StyledInfoIcon = styled(InfoCircleOutlined)`
	color: ${({ theme }) => theme.colors.gray[500] || "#8c8c8c"};
	margin-left: 6px;
	cursor: pointer;
	font-size: 16px;
	vertical-align: middle;
`;

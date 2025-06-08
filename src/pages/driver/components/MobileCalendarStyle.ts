import { createGlobalStyle } from "styled-components";

const MobileCalendarStyle = createGlobalStyle`
	.ant-picker-dropdown .ant-picker-panels {
		display: flex !important;
		flex-direction: column !important;
	}
	.ant-picker-dropdown .ant-picker-panel-container {
		flex-direction: column !important;
	}
	.ant-picker-dropdown .ant-picker-cell {
		font-size: 16px;
	}
	.ant-picker-dropdown .ant-picker-header {
		font-size: 18px;
	}
	.ant-picker-dropdown .ant-picker-header-view {
		font-size: 18px;
	}
	.ant-picker-dropdown .ant-picker-header-super-prev-btn,
	.ant-picker-dropdown .ant-picker-header-super-next-btn,
	.ant-picker-dropdown .ant-picker-header-prev-btn,
	.ant-picker-dropdown .ant-picker-header-next-btn {
		font-size: 18px;
	}
	.ant-picker-dropdown .ant-picker-week-panel-row {
		font-size: 16px;
	}
	.ant-picker-dropdown .ant-picker-week-panel-row th {
		font-size: 16px;
	}
`;

export default MobileCalendarStyle;

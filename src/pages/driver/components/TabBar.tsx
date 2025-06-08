import { Tabs } from "antd";
import { useCallback } from "react";
import styled from "styled-components";

interface TabBarProps {
	activeTab: "period" | "daily";
	onChange: (tab: "period" | "daily") => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
	const handleChange = useCallback(
		(key: string) => {
			onChange(key as "period" | "daily");
		},
		[onChange],
	);

	return (
		<StyledTabs
			activeKey={activeTab}
			onChange={handleChange}
			centered
			items={[
				{ key: "period", label: "기간별 통계" },
				{ key: "daily", label: "일별 기록" },
			]}
			tabBarGutter={132}
		/>
	);
}

const StyledTabs = styled(Tabs)`
  && {
    .ant-tabs-nav {
      margin: 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    }
    .ant-tabs-tab {
      font-size: ${({ theme }) => theme.fontSizes.lg};
      font-weight: ${({ theme }) => theme.fontWeights.medium};
    }
    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${({ theme }) => theme.colors.text.primary} !important;
    }
    .ant-tabs-ink-bar {
      background: ${({ theme }) => theme.colors.text.primary} !important;
    }
  }
`;

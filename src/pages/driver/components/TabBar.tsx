import { Tabs } from "antd";
import { useCallback } from "react";
import styled from "styled-components";

interface TabBarProps {
	activeTab: "dispatch" | "period" | "daily";
	onChange: (tab: "dispatch" | "period" | "daily") => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
	const handleChange = useCallback(
		(key: string) => {
			onChange(key as "dispatch" | "period" | "daily");
		},
		[onChange],
	);

	return (
		<StyledTabs
			activeKey={activeTab}
			onChange={handleChange}
			centered
			items={[
				{ key: "dispatch", label: "배차" },
				{ key: "period", label: "기간별 통계" },
				{ key: "daily", label: "일별 기록" },
			]}
			tabBarGutter={32}
			size="large"
		/>
	);
}

const StyledTabs = styled(Tabs)`
  && {
    width: 100%;
    
    .ant-tabs-nav {
      margin: 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
      padding: 0 16px;
    }
    
    .ant-tabs-nav-list {
      width: 100%;
      justify-content: space-between;
    }
    
    .ant-tabs-tab {
      flex: 1;
      margin: 0;
      padding: 12px 8px;
      font-size: ${({ theme }) => theme.fontSizes.md};
      font-weight: ${({ theme }) => theme.fontWeights.medium};
      text-align: center;
      min-width: 0;
      
      &:not(:last-child) {
        margin-right: 0;
      }
    }
    
    .ant-tabs-tab-btn {
      width: 100%;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${({ theme }) => theme.colors.text.primary} !important;
      font-weight: ${({ theme }) => theme.fontWeights.semibold};
    }
    
    .ant-tabs-ink-bar {
      background: ${({ theme }) => theme.colors.text.primary} !important;
      height: 3px;
      border-radius: 2px;
    }
    
    .ant-tabs-content-holder {
      padding: 4px 0;
    }
  }
`;

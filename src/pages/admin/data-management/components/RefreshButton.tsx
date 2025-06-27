import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface RefreshButtonProps {
	onRefresh: () => void;
	isLoading: boolean;
}

export const RefreshButton = ({ onRefresh, isLoading }: RefreshButtonProps) => {
	return (
		<Button
			icon={<ReloadOutlined />}
			onClick={onRefresh}
			loading={isLoading}
			size="small"
		>
			새로고침
		</Button>
	);
};

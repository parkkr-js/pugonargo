import { TableOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { memo } from "react";

const { Title, Paragraph } = Typography;

export const PageHeader = memo(() => {
	return (
		<div style={{ marginBottom: "24px" }}>
			<Title
				level={2}
				style={{
					margin: 0,
					display: "flex",
					alignItems: "center",
					gap: "8px",
				}}
			>
				<TableOutlined />
				연동 시트 관리
			</Title>
			<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
				데이터를 불러올 시트를 관리하세요
			</Paragraph>
		</div>
	);
});

PageHeader.displayName = "PageHeader";

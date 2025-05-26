import { Card } from "antd";

export const ProcessingCard = () => (
	<Card style={{ marginTop: "16px", textAlign: "center" }}>
		<div style={{ padding: "20px" }}>
			<div>📊 시트 데이터를 처리하고 있습니다...</div>
			<div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
				잠시만 기다려주세요.
			</div>
		</div>
	</Card>
);

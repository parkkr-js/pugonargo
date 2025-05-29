import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<ConfigProvider
		theme={{
			token: {
				colorPrimary: "#2A37E4",
			},
		}}
	>
		<App />
	</ConfigProvider>,
);

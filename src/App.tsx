// App.js - AntApp 제거 (Layout에서 처리)
import { GoogleOAuthProvider } from "@react-oauth/google";
import { App as AntApp, ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { store } from "./store";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
if (!clientId) {
	throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set");
}

const App = () => (
	<GoogleOAuthProvider clientId={clientId}>
		<Provider store={store}>
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: "#1890ff",
					},
				}}
			>
				<AntApp>
					<RouterProvider router={router} />
				</AntApp>
			</ConfigProvider>
		</Provider>
	</GoogleOAuthProvider>
);

export default App;

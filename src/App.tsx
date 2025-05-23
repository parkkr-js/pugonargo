import { GoogleOAuthProvider } from "@react-oauth/google";
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
			<RouterProvider router={router} />
		</Provider>
	</GoogleOAuthProvider>
);

export default App;

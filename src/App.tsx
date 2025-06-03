import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { queryClient } from "./lib/queryClient";
import { AppRouter } from "./routes/AppRouter";

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ConfigProvider locale={koKR}>
				<AppRouter />
				{process.env.NODE_ENV === "production" && (
					<ReactQueryDevtools initialIsOpen={false} />
				)}
			</ConfigProvider>
		</QueryClientProvider>
	);
}

export default App;

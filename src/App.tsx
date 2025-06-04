import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ThemeProvider } from "styled-components";
import { queryClient } from "./lib/queryClient";
import { AppRouter } from "./routes/AppRouter";
import { customTheme, theme } from "./styles/theme";

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ConfigProvider locale={koKR} theme={customTheme}>
				<ThemeProvider theme={theme}>
					<AppRouter />
					{process.env.NODE_ENV === "production" && (
						<ReactQueryDevtools initialIsOpen={false} />
					)}
				</ThemeProvider>
			</ConfigProvider>
		</QueryClientProvider>
	);
}

export default App;

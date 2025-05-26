import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "antd";
// src/ui/deskTop/components/manageGoogleSheets/GoogleAuthButton.tsx
import type React from "react";

interface GoogleAuthButtonProps {
	onSuccess: (token: string) => void;
	onError: () => void;
	loading?: boolean;
	isAuthenticated?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
	onSuccess,
	onError,
	loading = false,
	isAuthenticated = false,
}) => {
	const login = useGoogleLogin({
		scope:
			"https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly",
		onSuccess: (tokenResponse) => {
			onSuccess(tokenResponse.access_token);
		},
		onError: () => {
			onError();
		},
	});

	return (
		<Button
			type="primary"
			onClick={() => login()}
			loading={loading}
			disabled={isAuthenticated}
			size="large"
		>
			{isAuthenticated ? "구글 계정 연결됨" : "구글 계정 연결"}
		</Button>
	);
};

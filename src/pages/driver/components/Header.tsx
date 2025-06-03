import { Button } from "antd";

interface HeaderProps {
	onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
	return (
		<header
			style={{
				padding: 16,
				fontWeight: 700,
				fontSize: 20,
				textAlign: "center",
				position: "relative",
			}}
		>
			푸고나르고(P&N)
			<Button
				type="text"
				style={{
					position: "absolute",
					right: 16,
					top: 12,
					fontSize: 14,
					color: "#888",
				}}
				onClick={onLogout}
			>
				로그아웃
			</Button>
		</header>
	);
}

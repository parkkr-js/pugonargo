// src/styles/colors.ts

export const colors = {
	// 시그니처 컬러
	primary: "#1E266F",

	// 배경 컬러
	background: {
		main: "#ffffff",
		secondary: "rgba(153, 153, 153, 0.1)", // 999999 10%
		dark: "#f5f5f5",
	},

	// 그레이 팔레트
	gray: {
		50: "#fafafa",
		100: "#f5f5f5",
		200: "#eeeeee",
		300: "#e0e0e0",
		400: "#bdbdbd",
		500: "#999999",
		600: "#757575",
		700: "#616161",
		800: "#424242",
		900: "#212121",
	},

	// 액센트 컬러
	accent: {
		blue: "#1677ff", // Ant Design 기본 파랑
		green: "#52c41a", // 성공
		orange: "#fa8c16", // 경고
		red: "#ff4d4f", // 에러
		purple: "#722ed1", // 보조
	},

	// 시맨틱 컬러
	semantic: {
		success: "#52c41a",
		warning: "#fa8c16",
		error: "#ff4d4f",
		info: "#1677ff",
	},

	// 텍스트 컬러
	text: {
		primary: "#1E266F", // 시그니처 컬러로 메인 텍스트
		secondary: "rgba(0, 0, 0, 0.65)",
		disabled: "rgba(0, 0, 0, 0.25)",
		inverse: "#ffffff",
	},

	// 보더 컬러
	border: {
		light: "#f0f0f0",
		default: "#d9d9d9",
		dark: "#999999",
	},
} as const;

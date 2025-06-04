// src/styles/theme.ts

import { colors } from "./colors";

export const customTheme = {
	token: {
		colorPrimary: "#1E266F",
	},
	components: {
		Button: {
			colorPrimary: "#1E266F",
			colorPrimaryHover: "#1E266F",
			colorPrimaryActive: "#1E266F",
		},
		Tabs: {
			inkBarColor: "#1E266F",
			itemSelectedColor: "#1E266F",
			itemColor: "#888",
		},
	},
};

export const theme = {
	colors,

	// 폰트
	fonts: {
		primary:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
	},

	// 폰트 크기
	fontSizes: {
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		md: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
	},

	// 폰트 가중치
	fontWeights: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},

	// 간격
	spacing: {
		xs: "0.25rem", // 4px
		sm: "0.5rem", // 8px
		md: "1rem", // 16px
		lg: "1.5rem", // 24px
		xl: "2rem", // 32px
		"2xl": "3rem", // 48px
		"3xl": "4rem", // 64px
	},

	// 반경
	borderRadius: {
		none: "0",
		sm: "0.125rem", // 2px
		md: "0.375rem", // 6px
		lg: "0.5rem", // 8px
		xl: "0.75rem", // 12px
		full: "9999px",
	},

	// 그림자 (업데이트된 버전)
	shadows: {
		none: "none",
		xs: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
		sm: "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
		md: "0 2px 8px 0 rgba(0, 0, 0, 0.12)", // 더 진하게
		lg: "0 4px 12px 0 rgba(0, 0, 0, 0.16)",
		xl: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
		"2xl": "0 12px 32px 0 rgba(0, 0, 0, 0.25)",

		// 카드용 그림자
		card: "0 2px 8px 0 rgba(0, 0, 0, 0.12)",
		cardHover: "0 4px 16px 0 rgba(0, 0, 0, 0.16)",

		// 시그니처 컬러 그림자
		primary: "0 4px 12px 0 rgba(30, 38, 111, 0.2)",
		primaryHover: "0 6px 16px 0 rgba(30, 38, 111, 0.3)",
	},

	// z-index
	zIndices: {
		dropdown: 1000,
		sticky: 1020,
		fixed: 1030,
		modal: 1040,
		popover: 1050,
		tooltip: 1060,
	},

	// 브레이크포인트
	breakpoints: {
		xs: "480px",
		sm: "576px",
		md: "768px",
		lg: "992px",
		xl: "1200px",
		"2xl": "1600px",
	},
} as const;

// 타입 정의
export type Theme = typeof theme;

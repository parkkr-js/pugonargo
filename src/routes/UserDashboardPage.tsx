import { Typography } from "antd";
import { useAuth } from "../features/auth/presentation/hooks/useAuth";
import UserDashboard from "../ui/mobile/components/userDashBoard";

const { Title } = Typography;

export const UserDashboardPage = () => {
	const { user } = useAuth();

	if (!user || user.userType !== "driver") {
		return null;
	}

	return (
		<div
			className={`
      min-h-screen bg-gray-50
      w-full max-w-sm mx-auto
      px-4 sm:px-5
      relative
    `}
		>
			<header
				className={`
        text-center sticky top-0 z-20
        pt-4 pb-6 sm:pt-6 sm:pb-8
        bg-gray-50 
        border-b border-gray-200
        backdrop-blur-sm bg-opacity-95
      `}
			>
				<Title
					level={3}
					className={`
            !mb-0 !font-bold
            text-xl sm:text-2xl
            transition-all duration-200
          `}
					style={{ color: "#1E266F", textAlign: "center" }}
				>
					푸고나르고(P&N)
				</Title>
			</header>

			<main className="pb-8 sm:pb-12">
				<UserDashboard />
			</main>
		</div>
	);
};

// ===================================================================
// 🔥 모바일 표준 크기 및 최적화 기준 (2024-2025)
// ===================================================================

/*
📱 모바일 뷰포트 표준 (2024-2025):

1. **최소 너비**: 320px (iPhone SE, 구형 안드로이드)
2. **주요 타겟**: 375px (iPhone 12/13/14), 390px (iPhone 14 Pro)
3. **최대 너비**: 428px (iPhone 14 Pro Max)
4. **권장 컨테이너**: 400px (대부분 기기 커버)

📐 Tailwind 반응형 설정:
- max-w-sm: 384px (24rem) ✅ 선택
- max-w-md: 448px (28rem) - 너무 넓음
- max-w-xs: 320px (20rem) - 너무 좁음

🎯 패딩 최적화:
- 모바일: 16px (px-4)
- 큰 모바일: 20px (sm:px-5)
- 안전 영역 고려

⚡ 성능 최적화:
- backdrop-blur-sm: 네이티브 블러 효과
- transition-all: 부드러운 애니메이션
- sticky header: 스크롤 시 헤더 고정
*/

# 🚀 푸고나르고 로그인 시스템

TanStack Query + Zustand를 사용한 완전한 로그인 시스템이 구축되었습니다.

## 📦 필요한 패키지 설치

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zustand react-router-dom
```

## 🎯 구현된 기능

### ✅ 인증 시스템
- **관리자 로그인**: Firebase 인증 사용
- **기사 로그인**: Firestore DB 조회 방식
- **로그인 상태 유지**: 새로고침해도 유지 (localStorage persistence)
- **자동 리다이렉트**: 역할에 따른 페이지 이동

### ✅ 보안 기능
- **보호된 라우트**: HOC를 사용한 접근 제어
- **관리자 전용 페이지**: 관리자가 아니면 접근 불가
- **인증 확인**: 로그인하지 않으면 로그인 페이지로 이동

### ✅ 사용자 인터페이스
- **통합 로그인 페이지**: 관리자/기사 탭으로 구분
- **관리자 대시보드**: 관리 기능 카드 UI
- **기사 페이지**: 기사 업무 관리 UI

## 🏗️ 폴더 구조

```
src/
├── types/auth.ts              # 인증 관련 타입
├── lib/
│   ├── firebase.ts           # Firebase 설정
│   └── queryClient.ts        # TanStack Query 설정
├── stores/authStore.ts       # Zustand 인증 스토어
├── services/authService.ts   # 인증 서비스 로직
├── hooks/useAuth.ts          # 인증 관련 훅
├── hoc/
│   ├── withAuth.tsx          # 인증 보호 HOC
│   └── withAdminAuth.tsx     # 관리자 권한 HOC
├── pages/
│   ├── auth/LoginPage.tsx    # 로그인 페이지
│   ├── admin/DashboardPage.tsx # 관리자 대시보드
│   └── driver/DriverPage.tsx # 기사 페이지
├── routes/AppRouter.tsx      # 라우터 설정
└── App.tsx                   # 메인 앱
```

## 🔐 인증 로직

### 관리자 로그인
```typescript
// Firebase 인증 사용
const adminLogin = useAdminLogin();

await adminLogin.mutateAsync({
  email: "admin@example.com",
  password: "password123"
});
```

### 기사 로그인
```typescript
// Firestore DB 조회
const driverLogin = useDriverLogin();

await driverLogin.mutateAsync({
  userId: "driver123",
  password: "1234"
});
```

## 🚦 라우팅 시스템

| 경로 | 설명 | 보호 수준 |
|------|------|-----------|
| `/` | 루트 (자동 리다이렉트) | - |
| `/login` | 로그인 페이지 | 공개 |
| `/dashboard` | 관리자 대시보드 | 관리자 전용 |
| `/driver` | 기사 페이지 | 로그인 필요 |

## 🎨 HOC 사용법

### 인증 보호
```typescript
import { withAuth } from '../hoc/withAuth';

const MyPage = () => <div>보호된 페이지</div>;
export default withAuth(MyPage);
```

### 관리자 권한 보호
```typescript
import { withAdminAuth } from '../hoc/withAdminAuth';

const AdminPage = () => <div>관리자 전용 페이지</div>;
export default withAdminAuth(AdminPage);
```

## 🏪 Zustand 스토어 사용법

```typescript
import { useAuthStore } from '../stores/authStore';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          안녕하세요, {user?.role === 'admin' ? user.email : user?.driverName}님!
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <div>로그인해주세요</div>
      )}
    </div>
  );
};
```

## 🔧 환경 변수 설정

`.env` 파일에 Firebase 설정 추가:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 📊 상태 관리

### 전역 상태 (Zustand)
- 사용자 정보
- 로그인 상태
- 로딩 상태

### 서버 상태 (TanStack Query)
- API 호출
- 캐싱
- 에러 처리
- 재시도 로직

## ✨ 주요 특징

1. **타입 안전성**: TypeScript로 완전한 타입 지원
2. **성능 최적화**: TanStack Query 캐싱
3. **상태 지속성**: localStorage를 통한 로그인 상태 유지
4. **보안**: HOC를 통한 라우트 보호
5. **사용자 경험**: 직관적인 UI와 자동 리다이렉트
6. **확장성**: 쉽게 새로운 기능 추가 가능

## 🚀 시작하기

1. 패키지 설치
2. 환경 변수 설정
3. Firebase 프로젝트 설정
4. 개발 서버 실행

```bash
npm install
npm start
```

## 🎉 완료!

이제 관리자는 `/dashboard`, 기사는 `/driver` 페이지로 자동 이동하며, 권한에 따라 접근이 제어됩니다! 
# 주식화사 푸고나르고 (Pugonargo)

물류 운송 기록을 수집·정제·분석하여 관리자/기사 역할에 맞는 업무 화면을 제공하는 웹 애플리케이션입니다.

## 외주 프로젝트 고지

이 저장소는 푸고나르고의 회사 외주 프로젝트 산출물입니다. 본 문서와 코드는 해당 의뢰 범위에 따라 설계/구현되었음을 명시합니다.

## 개발자

- 개발 책임: 박지성 (Full‑stack / Frontend 중심)

## 아키텍처 개요

본 프로젝트는 프런트엔드 레이어를 명확히 분리해 유지보수성과 테스트 용이성을 높였습니다.

- 컴포넌트 레이어: UI 표현과 상호작용 담당 (`src/pages`, `src/components`)
- 훅 레이어: 데이터 로딩/상태/비즈니스 로직 캡슐화 (`src/pages/**/hooks`, `src/driver/hooks`)
- 서비스 레이어: 외부 API·Firebase·파서 등 IO 경계 모듈 (`src/services/**`)
- HOC(고차 컴포넌트): 라우팅 가드/권한 제어 (`src/hoc/withAuth.tsx`, `src/hoc/withAdminAuth.tsx`)

React 18 기반으로 상태는 로컬 상태와 글로벌 상태를 분리하고, 서버 상태는 TanStack Query로, 사용자·권한 정보는 Zustand로 관리합니다.

## 주요 기능

- Google Drive/Sheets 연동 및 시트 데이터 파싱
- 배차 데이터 업로드·정제·검증 및 대시보드 시각화
- 월/주/일별 운행 기록 관리, 차량별 비용(유류/정비) 분석
- 관리자/기사 역할 기반의 접근 제어 및 전용 화면
- 시트/파일 관리(시트 목록, 최신 동기화, Firestore 보관)

## 기술 스택

- 언어/런타임: React 18, TypeScript(strict), Node.js 20+
- 상태/데이터: TanStack Query(@tanstack/react-query), Zustand
- 라우팅: React Router v6
- 스타일: styled-components v6 (테마 타입 확장), 일부 Emotion 사용
- Firebase: Authentication, Firestore, Hosting, Cloud Functions
- Google API: googleapis (Drive/Sheets)
- 유틸리티: dayjs/moment, antd(컴포넌트), react-datepicker
- 품질: Biome(포맷/린트)

## 폴더 구조

```
src/
  hoc/
    withAuth.tsx
    withAdminAuth.tsx
  lib/
    firebase.ts            # Firebase 초기화(Auth/Firestore)
    queryClient.ts         # React Query 기본 정책(staleTime, retry)
  pages/
    admin/
      dashboard/           # 월별 비용 분석/통계
      data-management/     # 월별 통계 삭제/갱신
      dispatch/            # 배차 시트 연동/처리
      drivers/             # 기사 CRUD
      sheet-management/    # Google 계정 인증/시트 관리
      transactions/        # 거래/비용 조회
    auth/
      LoginPage.tsx
      useAuth.ts
    driver/                # 기사 전용 화면(일별/기간 통계, 유류/정비 기록)
  services/                # Firestore/GoogleAPI/도메인 서비스
  stores/                  # Zustand 스토어(권한/사용자)
  types/                   # 도메인 타입
  utils/                   # 계산/정규화/리다이렉트 유틸
  styles/                  # styled-components 테마/타입
```

## 권한/라우팅 아키텍처(HOC)

- `withAuth`: 인증 여부를 확인하고 비인증 사용자를 로그인으로 리다이렉트합니다.
- `withAdminAuth`: 관리자 권한(`role === "admin"`)을 확인하고 권한 없는 접근을 차단합니다.

역할 정보는 `useAuthStore`(Zustand)에 저장되며, `isAdmin`, `isDriver` 메서드로 분기합니다.

## 상태 관리 전략

- 서버 상태: TanStack Query
  - `staleTime: 5분`, 인증/권한 오류는 자동 재시도 제외, 지수 백오프
- 전역 앱 상태: Zustand
  - 사용자/권한 정보는 `persist`로 일부 키만 영속화(localStorage)
- 로컬 UI 상태: 각 컴포넌트 내부 상태로 격리

## 성능 최적화

- 렌더 분리: 데이터 훅과 프레젠테이션 컴포넌트 분리
- 불필요 재렌더 방지: 쿼리 키 설계, 메모화, 선택적 상태 구독(Zustand 셀렉터)
- 네트워크: 쿼리 캐싱·동시성 제어, 에러별 재시도 정책 분리
- 코드 분할: 라우트 단위 지연 로딩 적용 가능 구조

## 환경 변수

`src/lib/firebase.ts`에서 다음 환경 변수를 사용합니다.

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

로컬 개발 시 `.env.local`에 설정하세요(예시).

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

## 실행 및 배포

전제: Node.js 20+, pnpm 8+.

설치

```
pnpm install
```

개발 서버

```
pnpm start
```

프로덕션 빌드

```
pnpm build
```

Firebase Hosting 배포(권장 `firebase-tools` 로그인 상태)

```
pnpm run deploy:dev   # preview 채널 배포
pnpm run deploy:prod  # live 채널 배포
```

Cloud Functions(선택적): `functions/` 디렉터리 내 스크립트를 사용합니다.

```
cd functions
npm install
npm run deploy
```

자세한 배포 플로우는 `DEPLOYMENT_GUIDE.md`를 참고하세요.

## 서비스 레이어(예시)

- `services/dispatch/*`: 시트 데이터 수집/파싱/저장
- `services/sheet-management/*`: Google 인증·시트 메타 관리
- `services/dashboard/*`: 월별 유류/정비 비용 통계
- `services/driver/*`: 기사 CRUD

## 테스트/품질

- Testing Library/Jest 환경을 포함합니다.
- Biome로 코드 포맷/린트를 수행합니다.

```
pnpm run lint
pnpm run lint:fix
```

## 라이선스

MIT License © 2025 ParkJiSung. 상세 내용은 `LICENSE` 파일을 참고하세요.

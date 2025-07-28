# 배포 가이드

## 환경 분리 설정 (데이터베이스 공유)

### 운영 환경 (Production)
- **브랜치**: `main`
- **Firebase 프로젝트**: `pugonargo-c652f`
- **배포 채널**: `live` (기본 URL)
- **배포 트리거**: main 브랜치에 push 시 자동 배포
- **URL**: https://pugonargo-c652f.web.app

### 개발 환경 (Development)
- **브랜치**: `develop`
- **Firebase 프로젝트**: `pugonargo-c652f` (동일)
- **배포 채널**: `preview` (임시 URL)
- **배포 트리거**: develop 브랜치에 push 시 자동 배포
- **URL**: https://pugonargo-c652f--preview-[hash].web.app

### 데이터베이스 공유
- **Firestore**: 동일한 데이터베이스 공유
- **Authentication**: 동일한 사용자 인증 시스템
- **Storage**: 동일한 파일 저장소

## 설정 단계

### 1. Firebase Hosting Channels 설정
```bash
# Firebase CLI로 preview 채널 생성
firebase hosting:channel:create preview
```

### 2. 개발 브랜치 생성
```bash
git checkout -b develop
git push origin develop
```

## 배포 프로세스

### 개발 환경 배포
```bash
# develop 브랜치에서 작업
git checkout develop
git add .
git commit -m "개발 기능 추가"
git push origin develop
# 자동으로 preview 채널에 배포됨
```

### 운영 환경 배포
```bash
# main 브랜치로 머지
git checkout main
git merge develop
git push origin main
# 자동으로 live 채널에 배포됨
```

## 수동 배포 명령어

### 개발 환경 수동 배포
```bash
npm run deploy:dev
```

### 운영 환경 수동 배포
```bash
npm run deploy:prod
```

## Firebase Hosting Channels 장점

1. **데이터베이스 공유**: 동일한 Firestore 데이터베이스 사용
2. **환경 분리**: 호스팅만 분리되어 안전한 테스트 가능
3. **임시 URL**: preview 채널은 임시 URL로 접근 가능
4. **자동 만료**: preview 채널은 7일 후 자동 만료 (필요시 연장 가능)

## 주의사항

1. **데이터 공유**: 개발/운영 환경이 동일한 데이터베이스를 사용하므로 주의 필요
2. **테스트 데이터**: 개발 시 테스트 데이터 생성에 주의
3. **환경변수**: 동일한 환경변수 사용 (별도 설정 불필요)
4. **채널 관리**: preview 채널은 자동 만료되므로 필요시 연장 필요
5. **Google OAuth**: 개발 환경에서 자동으로 리디렉션 URL이 설정됨

## 채널 관리 명령어

```bash
# preview 채널 목록 확인
firebase hosting:channel:list

# preview 채널 연장 (7일)
firebase hosting:channel:deploy preview --expires 7d

# preview 채널 삭제
firebase hosting:channel:delete preview
``` 
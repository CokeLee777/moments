# 찰나 (Moments)

트렌드 뉴스 요약 푸시 알림 앱. 사용자가 관심 주제(IT, AI, 패션, 자동차)를 선택하면 매일 Claude AI가 요약한 트렌드 뉴스를 푸시 알림으로 받아볼 수 있습니다.

## 아키텍처

```
moments/
├── apps/
│   ├── mobile/          # Expo (React Native) 앱
│   └── functions/       # Firebase Cloud Functions 백엔드
└── packages/
    └── shared/          # 공통 TypeScript 타입
```

**데이터 흐름:** Firebase Functions (Claude API로 뉴스 요약) → Firestore 저장 → FCM 푸시 알림 → Expo 앱

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | pnpm 10 workspaces + Turborepo 2 |
| 모바일 | Expo SDK 54 (Managed Workflow), React Native 0.81 |
| 백엔드 | Firebase Functions v7 (Node.js 22) |
| 언어 | TypeScript 6 (루트/Functions), TypeScript ~5.9 (Expo 호환) |
| 린트/포맷 | ESLint 10 (flat config) + Prettier 3 |
| CI/CD | GitHub Actions |

## 시작하기

### 사전 요구사항

- Node.js >= 20.19.0
- pnpm 10.x (`npm install -g pnpm`)

### 설치

```bash
pnpm install
```

### 개발

```bash
# Expo 앱 실행
pnpm dev:mobile

# Firebase Functions 개발 (watch 모드)
pnpm dev:functions
```

## 루트 명령어

```bash
pnpm build        # 전체 빌드 (shared → functions → mobile 순서)
pnpm typecheck    # 전체 타입 체크
pnpm lint         # 전체 린트
pnpm dev:mobile   # Expo 개발 서버
pnpm dev:functions # Functions tsc --watch
```

## 워크스페이스별 명령어

```bash
# shared 타입 패키지
pnpm --filter @moments/shared build
pnpm --filter @moments/shared typecheck

# Firebase Functions
pnpm --filter @moments/functions build
pnpm --filter @moments/functions lint
pnpm --filter @moments/functions dev       # tsc --watch

# Expo 앱
pnpm --filter @moments/mobile start        # expo start
pnpm --filter @moments/mobile ios
pnpm --filter @moments/mobile android
```

## Firebase 배포

### 사전 준비

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. `.firebaserc`의 `<FIREBASE_PROJECT_ID>`를 실제 프로젝트 ID로 교체
3. Firebase CLI 설치: `npm install -g firebase-tools`
4. 로그인: `firebase login`

### 배포

```bash
# Functions만 배포
firebase deploy --only functions

# 또는 predeploy 포함 (자동으로 빌드 후 배포)
firebase deploy
```

### GitHub Actions CD 설정

CI/CD 자동 배포를 위해 GitHub 저장소에 다음 Secrets를 등록하세요:

| Secret | 값 | 확인 방법 |
|--------|----|-----------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | Firebase 콘솔 > 프로젝트 설정 |
| `FIREBASE_TOKEN` | CI용 인증 토큰 | `npx firebase-tools login:ci` 실행 |

`main` 브랜치에 `apps/functions/**`, `packages/shared/**`, `firebase.json`, `pnpm-lock.yaml` 변경이 push되면 자동으로 배포됩니다.

## CI

Pull Request가 `main`을 대상으로 열리면 자동으로 lint → typecheck → build를 실행합니다.

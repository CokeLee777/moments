# 찰나 (Moments) — Codebase Guide

## 프로젝트 개요

트렌드 뉴스 요약 푸시 알림 앱. Firebase Functions이 Claude API로 뉴스를 요약해 Firestore에 저장하고, FCM으로 Expo 앱에 푸시 알림을 보내는 서버리스 구조.

## 모노레포 구조

```
moments/
├── apps/
│   ├── functions/       # @moments/functions — Firebase Cloud Functions 백엔드
│   └── mobile/          # @moments/mobile — Expo (React Native) 앱
├── packages/
│   └── shared/          # @moments/shared — 공통 TypeScript 타입 (Topic, TrendSummary, NotificationPayload)
├── .github/workflows/
│   ├── ci.yml           # PR → lint + typecheck + build
│   └── deploy.yml       # main push → Firebase Functions 자동 배포
├── turbo.json           # Turborepo 2.x 파이프라인 (tasks 키 사용, pipeline 아님)
├── eslint.config.mjs    # ESLint 10 flat config (ignores 블록이 첫 번째 요소여야 함)
└── tsconfig.base.json   # 공통 TS 설정 (target/module/moduleResolution은 각 워크스페이스에서 지정)
```

## 빌드 명령어

```bash
pnpm build        # turbo build (shared → functions → mobile 순)
pnpm typecheck    # turbo typecheck
pnpm lint         # turbo lint (빌드 후 실행)
pnpm dev:mobile   # expo start
pnpm dev:functions # tsc --watch
```

## TypeScript 설정 — 중요 사항

각 워크스페이스가 서로 다른 TS module 설정을 사용합니다. 이유가 있으므로 변경 시 주의:

| 워크스페이스 | module | moduleResolution | 이유 |
|---|---|---|---|
| `packages/shared` | Node16 | node16 | TS6 유효한 CJS 출력 조합 |
| `apps/functions` | Node16 | node16 | Firebase Functions CJS 런타임 |
| `apps/mobile` | (expo/tsconfig.base 위임) | (expo/tsconfig.base 위임) | Expo SDK 필수 설정 포함 |

- `tsconfig.base.json`에 `module`/`moduleResolution`/`target`이 없는 것은 의도적입니다 — 워크스페이스마다 다르게 설정해야 하기 때문입니다.
- `apps/mobile/tsconfig.json`은 `../../tsconfig.base.json`이 아닌 `expo/tsconfig.base`를 extends합니다 — Expo SDK별 React Native 타입 설정이 포함되어 있기 때문입니다.
- `module: CommonJS` + `moduleResolution: bundler` 조합은 TS6에서 유효하지 않습니다. 사용하지 마세요.

## ESLint 설정 — 중요 사항

- ESLint 10 flat config 사용. `.eslintrc.js` 파일 없음.
- `eslint.config.mjs`에서 `ignores` 블록은 **반드시 첫 번째 요소**여야 합니다 (글로벌 ignore는 standalone 요소로 분리).
- `--ext` 플래그는 ESLint 10에서 제거됨. 각 워크스페이스의 lint 스크립트에서 사용하지 않습니다.
- `typescript-eslint` v8 단일 패키지 사용. 구버전의 `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` 분리 패키지 사용 금지.

## Turborepo

- `turbo.json`은 `tasks` 키 사용 (Turborepo 2.x). `pipeline` 키는 1.x에서 deprecated됨.
- `lint`와 `typecheck`는 `dependsOn: ["^build"]`로 설정 — `@moments/shared`가 먼저 빌드된 후 실행됩니다.

## 워크스페이스 의존성

```
@moments/mobile
  └── @moments/shared (workspace:*)

@moments/functions
  └── @moments/shared (workspace:*)
  └── firebase-functions ^7.2.5
```

`@moments/shared`가 다른 워크스페이스보다 먼저 빌드되어야 합니다. Turborepo가 `dependsOn: ["^build"]`를 통해 자동으로 처리합니다.

## Firebase 설정

- `.firebaserc`: `<FIREBASE_PROJECT_ID>` 플레이스홀더를 실제 프로젝트 ID로 교체 필요.
- `firebase.json`: Functions 소스는 `apps/functions`, predeploy에서 shared와 functions를 순서대로 빌드.
- `firebase-admin`은 현재 `apps/functions/package.json`에 없습니다 — Firestore/FCM 구현 시 추가하세요.

## GitHub Actions

- **CI** (`ci.yml`): PR → main 시 lint + typecheck + build. 같은 브랜치의 이전 실행을 자동 취소.
- **CD** (`deploy.yml`): main push 시 (functions/shared/firebase.json/lockfile 변경이 있을 때) 자동 배포.
- 두 워크플로우 모두 `pnpm/action-setup@v4 version: 10` 사용 (pnpm 10.33.2 매칭).
- CD에는 `FIREBASE_PROJECT_ID`, `FIREBASE_TOKEN` GitHub Secrets가 필요합니다.

## 주제 (Topics)

현재 지원하는 주제 카테고리 (`packages/shared/src/types/topic.ts`):
- `it` — IT/기술
- `ai` — 인공지능
- `fashion` — 패션
- `automotive` — 자동차

## 향후 구현 예정

- Claude API 연동 (뉴스 크롤링 + 요약)
- Firestore 데이터 저장
- FCM 푸시 알림 발송
- Expo 앱 UI (주제 선택, 트렌드 카드, 알림 설정)
- EAS Build + EAS Submit CI/CD

# 찰나 웹 PWA 전환 설계

**날짜:** 2026-05-10  
**목표:** 네이티브 앱 배포를 중단하고 Expo Web + PWA로 Firebase Hosting에 배포

---

## 1. 아키텍처 개요

기존 `apps/mobile` Expo Router 앱을 `expo export --platform web`으로 정적 빌드하여 Firebase Hosting에 배포한다. PWA 설정을 추가해 모바일 웹에서 홈화면 추가 및 앱처럼 동작 가능하게 한다.

```
사용자 브라우저
  └─ Firebase Hosting (apps/mobile/dist)
        └─ Expo Web 빌드 (SPA + PWA)
              ├─ Firebase Auth (Google 로그인)
              ├─ Firestore (트렌드 요약, 유저 프로필)
              └─ Google AdSense (웹 광고)
```

---

## 2. 제거 항목

| 항목 | 파일/패키지 |
|---|---|
| 푸시 알림 전체 | `lib/notifications.ts`, `expo-notifications` 패키지 |
| 네이티브 광고 | `components/NativeAdCard.tsx`, `react-native-google-mobile-ads` 패키지, `lib/adUnits.ts` |
| 네이티브 Google 로그인 | `@react-native-google-signin/google-signin` 패키지 |
| AdMob SDK 초기화 | `_layout.tsx`의 `MobileAds().initialize()` |
| 알림 등록/리스너 | `_layout.tsx`의 `registerForPushNotifications()`, `setupNotificationListeners()` |
| Settings 알림 시간 섹션 | `settings.tsx`의 "알림" 섹션 + `notificationTimes` 관련 UI |
| EAS 배포 잡 | `.github/workflows/deploy.yml`의 `deploy-mobile` 잡 |

---

## 3. 교체 항목

### 3-1. Google Sign-in → Firebase Auth 웹 방식

`login.tsx`에서 `@react-native-google-signin/google-signin` 제거 후 Firebase Auth의 `GoogleAuthProvider` + `signInWithPopup` 사용.

```ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

### 3-2. NativeAdCard → WebAdCard

`components/WebAdCard.tsx` 신규 작성. `useEffect` 안에서 `(adsbygoogle = window.adsbygoogle || []).push({})` 호출로 AdSense 광고 슬롯을 초기화한다.

- AdSense 퍼블리셔 ID: `EXPO_PUBLIC_ADSENSE_ID` 환경변수
- AdSense 스크립트는 `apps/mobile/public/index.html`에 한 번만 삽입
- 홈 뉴스 목록(index.tsx)과 히스토리 탭(history.tsx)에 `WebAdCard` 삽입

---

## 4. 알림 탭 → 히스토리 탭

### 변경 사항

- 탭 이름: "알림" → "히스토리"
- 탭 파일명: `notifications.tsx` → `history.tsx`
- 탭 아이콘 교체

### 데이터 소스 변경

| 기존 | 변경 |
|---|---|
| `notifications/{uid}/items` | `trendSummaries` 컬렉션 |
| FCM 수신 시각 기준 정렬 | `date` 필드 기준 내림차순 정렬 |

### UI

- 날짜별 그룹 레이블 유지 (오늘/어제/날짜)
- 주제 배지, 카드 스타일 유지
- 상세 바텀시트 **그대로 유지** (PanResponder + Animated — react-native-web 동작 확인됨)
- 광고: 5개마다 WebAdCard 삽입

---

## 5. PWA 설정

### 파일 추가

- `apps/mobile/public/manifest.json`
  ```json
  {
    "name": "찰나",
    "short_name": "찰나",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#060b16",
    "theme_color": "#060b16",
    "icons": [...]
  }
  ```
- `apps/mobile/public/favicon.ico`
- `apps/mobile/public/icon-192.png`, `icon-512.png`

### app.json 설정

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./public/favicon.ico"
    }
  }
}
```

---

## 6. Firebase Hosting 배포

### firebase.json 수정

```json
{
  "hosting": {
    "public": "apps/mobile/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

### GitHub Actions (deploy.yml)

- `deploy-mobile` 잡 **제거**
- `deploy-web` 잡 추가 (`deploy-functions`와 병렬 실행, 동일 트리거)

```yaml
deploy-web:
  if: github.event.pull_request.merged == true && startsWith(github.head_ref, 'release/')
  name: Deploy Web (Firebase Hosting)
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: 'pnpm'
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter @moments/shared build
    - name: Expo Web Build
      working-directory: apps/mobile
      run: npx expo export --platform web
    - name: Deploy to Firebase Hosting
      run: npx firebase-tools@14 deploy --only hosting --project ${{ secrets.FIREBASE_PROJECT_ID }} --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## 7. Settings 탭 정리

제거:
- "알림" 섹션 전체 (알림 시간 배지, "변경" 버튼)
- `notificationTimes` 관련 UI

유지:
- 프로필 카드
- "구독" 섹션 (관심 주제)
- 로그아웃 버튼

---

## 8. 스케일 유틸리티 (`lib/scale.ts`)

`react-native`의 `Dimensions`를 사용하는 `s()`, `vs()`, `ms()` 함수는 웹에서도 동작하지만 뷰포트 기반 단위로 자동 매핑됨. 별도 수정 불필요.

---

## 9. 완료 기준

- [ ] `expo start --web`으로 로컬 실행 시 모든 화면 오류 없음
- [ ] Google Sign-in 웹에서 동작
- [ ] 홈/히스토리/설정 탭 정상 동작
- [ ] AdSense 광고 렌더링
- [ ] Firebase Hosting 배포 성공
- [ ] PWA: 모바일 브라우저에서 홈화면 추가 가능

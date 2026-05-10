# 찰나 웹 PWA 전환 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네이티브 앱 배포를 중단하고 기존 Expo Router 코드를 Expo Web + PWA로 전환해 Firebase Hosting에 자동 배포

**Architecture:** `apps/mobile`을 `expo export --platform web`으로 정적 빌드(SPA). 네이티브 전용 패키지(expo-notifications, react-native-google-mobile-ads, @react-native-google-signin)를 제거하고, Google 로그인은 Firebase `signInWithRedirect`, 광고는 Google AdSense로 대체한다. 알림 탭은 Firestore `trendSummaries` 기반 히스토리 탭으로 전환한다.

**Tech Stack:** Expo SDK 54, Expo Router v6, react-native-web, Firebase Auth/Firestore, Google AdSense, Firebase Hosting, GitHub Actions

---

## 파일 변경 목록

| 동작 | 경로 |
|---|---|
| 수정 | `apps/mobile/lib/firebase.ts` |
| 수정 | `apps/mobile/lib/auth.ts` |
| 수정 | `apps/mobile/lib/firestore.ts` |
| 수정 | `apps/mobile/app/_layout.tsx` |
| 수정 | `apps/mobile/app/(tabs)/_layout.tsx` |
| 수정 | `apps/mobile/app/(tabs)/settings.tsx` |
| 수정 | `apps/mobile/app/(tabs)/index.tsx` |
| 수정 | `apps/mobile/app.json` |
| 수정 | `firebase.json` |
| 수정 | `.github/workflows/deploy.yml` |
| 생성 | `apps/mobile/components/WebAdCard.tsx` |
| 생성 | `apps/mobile/app/(tabs)/history.tsx` |
| 생성 | `apps/mobile/web/index.html` |
| 생성 | `apps/mobile/public/manifest.json` |
| 삭제 | `apps/mobile/components/NativeAdCard.tsx` |
| 삭제 | `apps/mobile/lib/notifications.ts` |
| 삭제 | `apps/mobile/lib/adUnits.ts` |
| 삭제 | `apps/mobile/app/(tabs)/notifications.tsx` |

---

## Task 1: 네이티브 전용 패키지 제거 및 app.json 정리

**Files:**
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/app.json`

- [ ] **Step 1: package.json에서 네이티브 전용 패키지 제거**

`apps/mobile/package.json`의 `dependencies`에서 아래 3개를 삭제한다:
```json
// 삭제할 항목들
"expo-notifications": "~0.32.17",
"react-native-google-mobile-ads": "^16.3.3",
"@react-native-google-signin/google-signin": "^16.1.2",
```

- [ ] **Step 2: app.json 플러그인 제거 및 web 설정 추가**

`apps/mobile/app.json`의 `plugins` 배열에서 `expo-notifications`와 `react-native-google-mobile-ads` 항목을 제거하고, `web` 섹션을 업데이트한다.

변경 전 `plugins`:
```json
"plugins": [
  "expo-router",
  "expo-font",
  [
    "expo-notifications",
    { "icon": "./assets/icon.png", "color": "#3b82f6" }
  ],
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-3940256099942544~3347511713",
      "iosAppId": "ca-app-pub-3940256099942544~1458002511"
    }
  ]
]
```

변경 후 `plugins`:
```json
"plugins": [
  "expo-router",
  "expo-font"
]
```

변경 전 `web`:
```json
"web": {
  "favicon": "./assets/favicon.png"
}
```

변경 후 `web`:
```json
"web": {
  "bundler": "metro",
  "output": "single",
  "favicon": "./assets/favicon.png"
}
```

- [ ] **Step 3: 의존성 재설치**

```bash
cd apps/mobile && pnpm install
```

- [ ] **Step 4: 타입 체크로 빌드 오류 확인**

```bash
pnpm --filter @moments/mobile typecheck
```

Expected: 아직 import 오류가 많다 (아직 코드 수정 안 했으므로). 이 단계에서는 패키지 제거 확인만 한다.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/package.json apps/mobile/app.json pnpm-lock.yaml
git commit -m "chore(mobile): remove native-only packages, add web bundler config"
```

---

## Task 2: firebase.ts — 웹 Auth 초기화

**Files:**
- Modify: `apps/mobile/lib/firebase.ts`

웹에서는 `initializeAuth + getReactNativePersistence`가 동작하지 않는다. `Platform.OS === 'web'`일 때는 `getAuth`(브라우저 기본 persistence)를 사용한다.

- [ ] **Step 1: firebase.ts 전체 교체**

`apps/mobile/lib/firebase.ts`를 아래 내용으로 교체한다:

```ts
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: Platform.select({
    ios: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS!,
    android: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID!,
    default: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_WEB!,
  }),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app, 'moments');
```

- [ ] **Step 2: .env.local에 EXPO_PUBLIC_FIREBASE_APP_ID_WEB 추가**

Firebase Console → 프로젝트 설정 → 앱 목록에서 Web 앱의 App ID를 복사한다. Web 앱이 없다면 "앱 추가 → 웹"으로 새로 등록한다.

`apps/mobile/.env.local` (또는 루트 `.env.local`)에 추가:
```
EXPO_PUBLIC_FIREBASE_APP_ID_WEB=1:xxxx:web:xxxx
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/firebase.ts
git commit -m "fix(mobile): platform-conditional firebase auth for web"
```

---

## Task 3: auth.ts — Google Sign-in을 signInWithRedirect로 교체

**Files:**
- Modify: `apps/mobile/lib/auth.ts`

- [ ] **Step 1: auth.ts 전체 교체**

`apps/mobile/lib/auth.ts`를 아래 내용으로 교체한다:

```ts
import { GoogleAuthProvider, signInWithRedirect, signOut as _signOut } from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
}

export async function signOut(): Promise<void> {
  await _signOut(auth);
}
```

`signInWithRedirect`는 Google OAuth 페이지로 이동 후 돌아오면 Firebase가 자동으로 redirect result를 처리하고 `onAuthStateChanged`를 통해 사용자 정보가 반영된다.

- [ ] **Step 2: Firebase Console에서 웹 도메인 허용 설정 확인**

Firebase Console → Authentication → Settings → Authorized domains에 아래를 추가한다:
- `localhost` (로컬 개발)
- 배포 후: Firebase Hosting 도메인 (`<project-id>.web.app`, `<project-id>.firebaseapp.com`)

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/auth.ts
git commit -m "fix(mobile): replace native google sign-in with signInWithRedirect"
```

---

## Task 4: _layout.tsx — 푸시 알림 및 AdMob 코드 제거

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: _layout.tsx에서 알림/광고 관련 코드 제거**

`apps/mobile/app/_layout.tsx`에서 다음을 제거한다:

제거할 import 줄들:
```ts
import MobileAds from 'react-native-google-mobile-ads';
import { registerForPushNotifications, setupNotificationListeners } from '../lib/notifications';
```

제거할 useEffect 블록:
```ts
useEffect(() => {
  MobileAds().initialize().catch(() => {});
}, []);
```

```ts
useEffect(() => {
  if (!authReady) return;
  if (!auth.currentUser) return;
  void registerForPushNotifications();
  return setupNotificationListeners();
}, [authReady]);
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @moments/mobile typecheck
```

Expected: `notifications.ts`와 `adUnits.ts` 관련 오류가 여전히 있을 수 있다 (다음 태스크에서 처리).

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "fix(mobile): remove push notification and admob initialization"
```

---

## Task 5: firestore.ts — 히스토리용 데이터 조회 함수 추가

**Files:**
- Modify: `apps/mobile/lib/firestore.ts`

- [ ] **Step 1: getRecentTrendSummaries 함수 추가**

`apps/mobile/lib/firestore.ts` 파일 끝에 아래 함수를 추가한다:

```ts
export async function getRecentTrendSummaries(
  topics: string[],
  count: number = 50,
): Promise<TrendSummary[]> {
  if (topics.length === 0) return [];
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const q = query(
    collection(db, 'trendSummaries'),
    where('topicId', 'in', topics),
    where('createdAt', '>=', cutoff),
    orderBy('createdAt', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as TrendSummary);
}
```

기존 import 라인에 `limit`이 없으면 추가 확인:
```ts
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
```
(`limit`은 이미 import되어 있음.)

- [ ] **Step 2: Firestore 복합 인덱스 확인**

`getRecentTrendSummaries`는 `topicId (in)` + `createdAt (>=, desc)` 복합 쿼리를 사용한다. 기존 `getTrendSummary`가 동일 컬렉션에 `(topicId, createdAt)` 인덱스를 이미 사용하고 있어 대부분의 경우 인덱스가 존재한다. 

처음 호출 시 Firestore가 콘솔에 인덱스 생성 링크를 출력하면 클릭하여 생성한다.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/firestore.ts
git commit -m "feat(mobile): add getRecentTrendSummaries for history tab"
```

---

## Task 6: WebAdCard.tsx 생성

**Files:**
- Create: `apps/mobile/components/WebAdCard.tsx`

- [ ] **Step 1: WebAdCard.tsx 생성**

`apps/mobile/components/WebAdCard.tsx` 파일을 생성한다:

```tsx
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function WebAdCard() {
  const ref = useRef<View>(null);

  useEffect(() => {
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = process.env.EXPO_PUBLIC_ADSENSE_ID ?? '';
    ins.dataset.adSlot = process.env.EXPO_PUBLIC_ADSENSE_SLOT ?? '';
    ins.dataset.adFormat = 'auto';
    ins.dataset.fullWidthResponsive = 'true';
    el.appendChild(ins);

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, []);

  return (
    <View
      ref={ref}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        minHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.045)',
        overflow: 'hidden',
      }}
    />
  );
}
```

- [ ] **Step 2: .env.local에 AdSense 환경변수 추가**

Google AdSense 계정에서 퍼블리셔 ID와 광고 슬롯 ID를 확인한다.

`apps/mobile/.env.local`:
```
EXPO_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
EXPO_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX
```

AdSense 계정이 없으면 우선 빈 값으로 두고, 나중에 설정한다.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/components/WebAdCard.tsx
git commit -m "feat(mobile): add WebAdCard component for Google AdSense"
```

---

## Task 7: history.tsx 생성 (알림 탭 대체)

**Files:**
- Create: `apps/mobile/app/(tabs)/history.tsx`

- [ ] **Step 1: history.tsx 생성**

`apps/mobile/app/(tabs)/history.tsx` 파일을 생성한다:

```tsx
import { useEffect, useRef, useState, Fragment } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getRecentTrendSummaries, getUserProfile } from '../../lib/firestore';
import { WebAdCard } from '../../components/WebAdCard';
import type { TrendSummary } from '@moments/shared';

const TOPIC_DOT_BG: Record<string, string> = {
  ai: '#eff6ff',
  it: '#eff6ff',
  fashion: '#fdf2f8',
  automotive: '#dbeafe',
};

const TOPIC_LABEL: Record<string, string> = {
  ai: 'AI',
  it: 'IT',
  fashion: '패션',
  automotive: '자동차',
};

const TOPIC_BADGE_TEXT: Record<string, string> = {
  ai: '#3b82f6',
  it: '#3b82f6',
  fashion: '#ec4899',
  automotive: '#6366f1',
};

const TOPIC_ICONS: Record<string, string> = {
  ai: '🤖',
  it: '🖥️',
  fashion: '👗',
  automotive: '🚗',
};

function dayKey(dateStr: string): string {
  return new Date(dateStr).toDateString();
}

function groupLabel(dateStr: string): string {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const dk = dayKey(dateStr);
  if (dk === today) return '오늘';
  if (dk === yesterday) return '어제';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  if (h === 0) return `오전 12:${m}`;
  if (h < 12) return `오전 ${h}:${m}`;
  if (h === 12) return `오후 12:${m}`;
  return `오후 ${h - 12}:${m}`;
}

export default function HistoryScreen() {
  const [summaries, setSummaries] = useState<TrendSummary[]>([]);
  const [selected, setSelected] = useState<TrendSummary | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 1.2) {
          setSelected(null);
          translateY.setValue(0);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (selected) translateY.setValue(0);
  }, [selected]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setSummaries([]); return; }
      const profile = await getUserProfile(user.uid);
      if (!profile?.topics?.length) return;
      const data = await getRecentTrendSummaries(profile.topics);
      setSummaries(data);
    });
    return unsub;
  }, []);

  const groups: { label: string; items: TrendSummary[] }[] = [];
  const seen = new Set<string>();
  for (const s of summaries) {
    const label = groupLabel(s.createdAt);
    if (!seen.has(label)) {
      seen.add(label);
      groups.push({ label, items: [] });
    }
    groups[groups.length - 1].items.push(s);
  }

  type FlatItem =
    | { type: 'label'; label: string; key: string }
    | { type: 'item'; item: TrendSummary; key: string }
    | { type: 'ad'; key: string };

  const flat: FlatItem[] = [];
  let count = 0;
  for (const group of groups) {
    flat.push({ type: 'label', label: group.label, key: `label-${group.label}` });
    for (const item of group.items) {
      flat.push({ type: 'item', item, key: item.id });
      count += 1;
      if (count % 5 === 0) flat.push({ type: 'ad', key: `ad-${count}` });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white px-4 pt-1.5 pb-2.5 border-b border-slate-100">
        <Text className="font-black text-slate-900" style={{ fontSize: 19, letterSpacing: -0.8 }}>
          히스토리
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ padding: 10, gap: 6 }}
      >
        {groups.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-muted text-xs">아직 트렌드 브리핑이 없어요</Text>
          </View>
        ) : (
          flat.map((entry) => {
            if (entry.type === 'label') {
              return (
                <Text
                  key={entry.key}
                  style={{
                    fontSize: 8,
                    fontWeight: '700',
                    color: '#94a3b8',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    paddingTop: 4,
                    paddingBottom: 2,
                    paddingHorizontal: 2,
                  }}
                >
                  {entry.label}
                </Text>
              );
            }
            if (entry.type === 'ad') {
              return <WebAdCard key={entry.key} />;
            }
            const item = entry.item;
            return (
              <TouchableOpacity
                key={entry.key}
                activeOpacity={0.7}
                onPress={() => setSelected(item)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingVertical: 9,
                  paddingHorizontal: 11,
                  flexDirection: 'row',
                  gap: 9,
                  alignItems: 'flex-start',
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.045)',
                }}
              >
                <View
                  className="w-7 h-7 rounded-[10px] items-center justify-center"
                  style={{ backgroundColor: TOPIC_DOT_BG[item.topicId] ?? '#eff6ff' }}
                >
                  <Text style={{ fontSize: 14 }}>{TOPIC_ICONS[item.topicId] ?? '📰'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: '700',
                      color: '#1e293b',
                      lineHeight: 9.5 * 1.3,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{ fontSize: 8.5, color: '#64748b', lineHeight: 13, marginTop: 2 }}
                  >
                    {item.summary}
                  </Text>
                  <Text
                    style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 3, fontWeight: '500' }}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setSelected(null)} />
        {selected && (
          <Animated.View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: 40,
              transform: [{ translateY }],
            }}
          >
            <View
              style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}
              {...panResponder.panHandlers}
            >
              <View
                style={{ width: 32, height: 4, backgroundColor: '#cbd5e1', borderRadius: 99 }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>{TOPIC_ICONS[selected.topicId] ?? '📰'}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 99,
                  backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: TOPIC_BADGE_TEXT[selected.topicId] ?? '#3b82f6',
                    letterSpacing: 0.2,
                  }}
                >
                  {TOPIC_LABEL[selected.topicId] ?? selected.topicId}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 }} />

            <ScrollView
              style={{ maxHeight: Dimensions.get('window').height * 0.62 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#0f172a',
                  lineHeight: 15 * 1.4,
                  marginBottom: 10,
                }}
              >
                {selected.title}
              </Text>
              <Text
                style={{ fontSize: 13.5, color: '#475569', lineHeight: 13.5 * 1.75 }}
              >
                {selected.summary}
              </Text>
              <Text
                style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, fontWeight: '500' }}
              >
                {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
              </Text>
            </ScrollView>
          </Animated.View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/history.tsx
git commit -m "feat(mobile): add history tab with trendSummaries data"
```

---

## Task 8: (tabs)/_layout.tsx — 탭 이름 및 아이콘 업데이트

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: BellIcon을 ClockIcon으로 교체 및 notifications → history 탭 변경**

`apps/mobile/app/(tabs)/_layout.tsx`에서:

1. `BellIcon` 함수를 `ClockIcon` 함수로 교체:

```tsx
function ClockIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={s(16)} height={s(16)} viewBox="0 0 24 24">
      {filled ? (
        <>
          <Path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" fill={color} />
          <Path d="M12 7v5l3 3" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <Path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke={color} strokeWidth={1.7} fill="none" />
          <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )}
    </Svg>
  );
}
```

2. `Tabs.Screen name="notifications"` → `name="history"`로, 아이콘도 변경:

```tsx
<Tabs.Screen
  name="history"
  options={{ tabBarIcon: ({ color, focused }) => <ClockIcon color={color} filled={focused} /> }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add "apps/mobile/app/(tabs)/_layout.tsx"
git commit -m "feat(mobile): rename notifications tab to history with clock icon"
```

---

## Task 9: settings.tsx — 알림 섹션 제거 및 WebAdCard 교체

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: settings.tsx에서 알림 섹션과 NativeAdCard 제거/교체**

`apps/mobile/app/(tabs)/settings.tsx`에서:

1. import 변경:
```tsx
// 제거
import { NativeAdCard } from '../../components/NativeAdCard';
// 추가
import { WebAdCard } from '../../components/WebAdCard';
```

2. `formatHour` import 제거 (알림 시간 UI가 사라지므로):
```tsx
// 제거
import { formatHour } from '../../components/TimeSlot';
```

3. "알림" 섹션 전체 제거 — 아래 블록을 삭제한다:
```tsx
{/* 알림 섹션 */}
<Text style={{ ... }}>알림</Text>
<View style={{ ... }}>
  <View className="flex-row items-center justify-between" style={{ marginBottom: 7 }}>
    <Text className="text-[10px] font-semibold text-slate-800">알림 시간</Text>
    <Pressable onPress={() => router.push('/onboarding?mode=times' as never)}>
      <Text className="text-[8.5px] font-bold text-primary">변경</Text>
    </Pressable>
  </View>
  <View className="flex-row gap-1.5 flex-wrap">
    {profile?.notificationTimes?.map((h) => (
      <View key={h} style={{ ... }}>
        <Text style={{ ... }}>{formatHour(h)}</Text>
      </View>
    ))}
  </View>
</View>
```

4. `NativeAdCard` → `WebAdCard`로 교체:
```tsx
// 제거
<NativeAdCard />
// 추가
<WebAdCard />
```

- [ ] **Step 2: Commit**

```bash
git add "apps/mobile/app/(tabs)/settings.tsx"
git commit -m "fix(mobile): remove notification settings section, replace NativeAdCard"
```

---

## Task 10: index.tsx — NativeAdCard를 WebAdCard로 교체

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: import 교체**

`apps/mobile/app/(tabs)/index.tsx`에서:

```tsx
// 제거
import { NativeAdCard } from '../../components/NativeAdCard';
// 추가
import { WebAdCard } from '../../components/WebAdCard';
```

- [ ] **Step 2: JSX 교체**

```tsx
// 제거
{i === 1 && summary.articles.length > 2 && <NativeAdCard />}
// 추가
{i === 1 && summary.articles.length > 2 && <WebAdCard />}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/mobile/app/(tabs)/index.tsx"
git commit -m "fix(mobile): replace NativeAdCard with WebAdCard in home screen"
```

---

## Task 11: 미사용 파일 삭제

**Files:**
- Delete: `apps/mobile/components/NativeAdCard.tsx`
- Delete: `apps/mobile/lib/notifications.ts`
- Delete: `apps/mobile/lib/adUnits.ts`
- Delete: `apps/mobile/app/(tabs)/notifications.tsx`

- [ ] **Step 1: 파일 삭제**

```bash
rm apps/mobile/components/NativeAdCard.tsx
rm apps/mobile/lib/notifications.ts
rm apps/mobile/lib/adUnits.ts
rm "apps/mobile/app/(tabs)/notifications.tsx"
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @moments/mobile typecheck
```

Expected: 오류 없음. 만약 아직 NativeAdCard나 notifications를 import하는 파일이 있다면 해당 import를 제거한다.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(mobile): delete native-only files (NativeAdCard, notifications, adUnits)"
```

---

## Task 12: PWA 설정

**Files:**
- Create: `apps/mobile/web/index.html`
- Create: `apps/mobile/public/manifest.json`

- [ ] **Step 1: web/index.html 생성**

`apps/mobile/web/index.html` 생성:

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
    />
    <meta name="theme-color" content="#060b16" />
    <link rel="manifest" href="/manifest.json" />
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=REPLACE_WITH_ADSENSE_ID"
      crossorigin="anonymous"
    ></script>
    %EXPO_HEAD%
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

`REPLACE_WITH_ADSENSE_ID`를 실제 AdSense 퍼블리셔 ID로 교체한다. (예: `ca-pub-1234567890123456`)

- [ ] **Step 2: public/manifest.json 생성**

```bash
mkdir -p apps/mobile/public
```

`apps/mobile/public/manifest.json` 생성:

```json
{
  "name": "찰나",
  "short_name": "찰나",
  "description": "AI가 매일 정리하는 트렌드 뉴스 브리핑",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#060b16",
  "theme_color": "#060b16",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 3: PWA 아이콘 준비**

`apps/mobile/assets/icon.png`를 192×192, 512×512 크기로 리사이즈하여 `apps/mobile/public/`에 저장한다.

macOS ImageMagick 또는 온라인 도구(squoosh.app 등) 사용:
```bash
# ImageMagick이 있다면
convert apps/mobile/assets/icon.png -resize 192x192 apps/mobile/public/icon-192.png
convert apps/mobile/assets/icon.png -resize 512x512 apps/mobile/public/icon-512.png
```

없다면 `assets/icon.png`를 수동으로 복사해 임시로 사용:
```bash
cp apps/mobile/assets/icon.png apps/mobile/public/icon-192.png
cp apps/mobile/assets/icon.png apps/mobile/public/icon-512.png
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/web/index.html apps/mobile/public/
git commit -m "feat(mobile): add PWA manifest and web HTML template"
```

---

## Task 13: Firebase Hosting 설정

**Files:**
- Modify: `firebase.json`

- [ ] **Step 1: firebase.json에 hosting 블록 추가**

`firebase.json`에 `hosting` 키를 추가한다. 기존 `firestore`, `functions`, `emulators` 블록은 그대로 유지한다:

```json
{
  "hosting": {
    "public": "apps/mobile/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": [...],
  "functions": [...],
  "emulators": {...}
}
```

- [ ] **Step 2: Commit**

```bash
git add firebase.json
git commit -m "feat: add firebase hosting config for web PWA"
```

---

## Task 14: GitHub Actions — deploy-mobile 제거, deploy-web 추가

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: deploy.yml에서 deploy-mobile 잡 제거, deploy-web 잡 추가**

`.github/workflows/deploy.yml`의 `jobs` 섹션을 아래로 교체한다:

```yaml
jobs:
  deploy-functions:
    if: github.event.pull_request.merged == true && startsWith(github.head_ref, 'release/')
    name: Deploy Firebase Functions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build shared
        run: pnpm --filter @moments/shared build

      - name: Build functions
        run: pnpm --filter @moments/functions build

      - name: Deploy to Firebase Functions
        run: npx firebase-tools@14 deploy --only functions --force --project ${{ secrets.FIREBASE_PROJECT_ID }} --token ${{ secrets.FIREBASE_TOKEN }}

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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build shared
        run: pnpm --filter @moments/shared build

      - name: Expo Web Build
        working-directory: apps/mobile
        run: npx expo export --platform web

      - name: Deploy to Firebase Hosting
        run: npx firebase-tools@14 deploy --only hosting --project ${{ secrets.FIREBASE_PROJECT_ID }} --token ${{ secrets.FIREBASE_TOKEN }}
```

`deploy-functions`와 `deploy-web`은 서로 독립적으로 병렬 실행된다 (`needs` 없음).

- [ ] **Step 2: GitHub Secrets 확인**

Repository Settings → Secrets에 아래가 설정되어 있는지 확인:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_TOKEN`

없다면 `firebase login:ci`로 토큰을 생성하여 추가한다.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: replace EAS mobile deploy with Firebase Hosting web deploy"
```

---

## Task 15: 로컬 스모크 테스트

- [ ] **Step 1: 웹 개발 서버 실행**

```bash
cd apps/mobile && pnpm web
# 또는
pnpm dev:mobile  # expo start → 터미널에서 w 입력
```

- [ ] **Step 2: 브라우저에서 확인할 항목**

| 화면 | 확인 항목 |
|---|---|
| 로딩 화면 | "찰나" 애니메이션 표시 |
| 로그인 화면 | "Google로 시작하기" 버튼 → Google OAuth 페이지로 이동 |
| 홈 탭 | 주제 탭, 트렌드 카드, 뉴스 목록 표시 |
| 히스토리 탭 | 날짜별 브리핑 목록 표시, 탭하면 바텀시트 열림 |
| 설정 탭 | 프로필, 관심 주제 표시 (알림 시간 섹션 없음) |
| 로그아웃 | 로그인 화면으로 이동 |

- [ ] **Step 3: 타입 체크 최종 확인**

```bash
pnpm typecheck
```

Expected: 오류 없음.

- [ ] **Step 4: 빌드 테스트**

```bash
cd apps/mobile && npx expo export --platform web
```

Expected: `dist/` 폴더 생성, `index.html` 포함.

---

## 환경변수 체크리스트

배포 전 아래 환경변수가 모두 설정되어 있어야 한다:

| 변수 | 용도 | 비고 |
|---|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_APP_ID_IOS` | Firebase | 기존 |
| `EXPO_PUBLIC_FIREBASE_APP_ID_WEB` | Firebase Web App | **신규** — Firebase Console에서 Web 앱 등록 후 추가 |
| `EXPO_PUBLIC_ADSENSE_ID` | Google AdSense | **신규** — AdSense 계정 퍼블리셔 ID |
| `EXPO_PUBLIC_ADSENSE_SLOT` | Google AdSense | **신규** — 광고 슬롯 ID |

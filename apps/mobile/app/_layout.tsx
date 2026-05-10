import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import {
  useFonts,
  NotoSerifKR_900Black,
} from '@expo-google-fonts/noto-serif-kr';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { ms, s, vs } from '../lib/scale';
import '../global.css';

const SPLASH_MIN_MS = 1500;

function LoadingScreen() {
  const breatheAnim = useRef(new Animated.Value(0.75)).current;
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.75,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.parallel(
      dotAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 280,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 280,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(840 - i * 200),
          ]),
        ),
      ),
    ).start();
  }, []);

  const glowSize = s(220);
  const dotSize = s(5);

  return (
    <View style={{ flex: 1, backgroundColor: '#060b16', alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -glowSize / 2 },
            { translateY: -(glowSize / 2 + vs(11)) },
          ],
        }}
      >
        <svg width={glowSize} height={glowSize}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={glowSize / 2} cy={glowSize / 2} rx={glowSize / 2} ry={glowSize / 2} fill="url(#glow)" />
        </svg>
      </View>

      <Animated.View style={{ opacity: breatheAnim, paddingVertical: s(4) }}>
        <Text
          style={{
            fontFamily: 'NotoSerifKR_900Black',
            fontSize: ms(42),
            color: '#fff',
            letterSpacing: -2,
          }}
        >
          찰나
        </Text>
      </Animated.View>

      <Text
        style={{
          fontSize: ms(10),
          color: 'rgba(255,255,255,0.35)',
          fontWeight: '500',
          marginTop: 6,
          letterSpacing: 0.3,
        }}
      >
        오늘의 트렌드를 한눈에
      </Text>

      <View style={{ flexDirection: 'row', gap: s(6), marginTop: vs(28) }}>
        {dotAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: 'rgba(255,255,255,0.5)',
              opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -vs(4)] }) },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
}

function RootContent() {
  const [fontsLoaded] = useFonts({ NotoSerifKR_900Black });
  const [splashMinDone, setSplashMinDone] = useState(false);
  const { user, profile, authReady } = useAuth();
  const router = useRouter();
  const lastRouteRef = useRef<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSplashMinDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authReady || !fontsLoaded || !splashMinDone) return;
    const dest = !user ? '/login' : !profile ? '/onboarding' : '/(tabs)';
    if (lastRouteRef.current === dest) return;
    lastRouteRef.current = dest;
    (window as any).hideSplash?.();
    router.replace(dest as never);
  }, [authReady, fontsLoaded, splashMinDone, user, profile]);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#060b16" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="찰나" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>찰나</title>
      </Head>
      <View style={{ flex: 1 }}>
        <Slot />
        {(!authReady || !fontsLoaded) && (
          <View style={StyleSheet.absoluteFill}>
            <LoadingScreen />
          </View>
        )}
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

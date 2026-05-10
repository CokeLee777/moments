import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import {
  useFonts,
  NotoSerifKR_900Black,
} from '@expo-google-fonts/noto-serif-kr';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';
import { ms, s, vs } from '../lib/scale';
import '../global.css';

function LoadingScreen() {
  const breatheAnim = useRef(new Animated.Value(0.75)).current;
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // "찰나" 숨쉬기 (opacity 0.75 ↔ 1)
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

    // 점 bounce + opacity
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
      {/* Glow: SVG RadialGradient — 목업과 동일한 rgba(99,102,241,0.38) 0% → transparent 70% */}
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

      {/* 글씨 잘림 방지: Animated.View로 감싸기 */}
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ NotoSerifKR_900Black });
  const [authReady, setAuthReady] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setDestination('/login');
      } else {
        try {
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
          const profile = await Promise.race([getUserProfile(user.uid), timeout]);
          setDestination(profile ? '/(tabs)' : '/onboarding');
        } catch {
          setDestination('/onboarding');
        }
      }
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (authReady && fontsLoaded && destination) {
      router.replace(destination as never);
    }
  }, [authReady, fontsLoaded, destination]);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {(!authReady || !fontsLoaded) && (
        <View style={StyleSheet.absoluteFill}>
          <LoadingScreen />
        </View>
      )}
    </View>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import {
  useFonts,
  NotoSerifKR_900Black,
} from '@expo-google-fonts/noto-serif-kr';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';
import { ms, s, vs } from '../lib/scale';
import '../global.css';

function LoadingScreen() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: vs(-5),
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((2 - i) * 150),
        ]),
      ),
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <View className="flex-1 bg-brand items-center justify-center">
      <Text
        style={{
          fontFamily: 'NotoSerifKR_900Black',
          fontSize: ms(42),
          color: '#fff',
          letterSpacing: -2,
          lineHeight: ms(42),
        }}
      >
        찰나
      </Text>
      <Text
        style={{ fontSize: ms(10), color: 'rgba(255,255,255,0.35)' }}
        className="font-medium mt-1.5 tracking-wide"
      >
        오늘의 트렌드를 한눈에
      </Text>
      <View className="flex-row gap-1.5 mt-7">
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              transform: [{ translateY: dot }],
              width: s(5),
              height: s(5),
              borderRadius: s(5),
              backgroundColor: 'rgba(255,255,255,0.5)',
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setDestination('/login');
      } else {
        const profile = await getUserProfile(user.uid);
        setDestination(profile ? '/(tabs)' : '/onboarding');
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (authReady && fontsLoaded && destination) {
      router.replace(destination as never);
    }
  }, [authReady, fontsLoaded, destination]);

  return (
    <>
      {(!authReady || !fontsLoaded) && <LoadingScreen />}
      <Slot />
    </>
  );
}

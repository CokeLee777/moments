import { useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithGoogle } from '../lib/auth';

const { width: SCREEN_W } = Dimensions.get('window');
// 카드 프리뷰 너비: hero px-5(20px) 양쪽 = SCREEN_W - 40
const CARD_W = SCREEN_W - 40;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cardH, setCardH] = useState(CARD_W * 0.38);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // sign-in errors are handled inside signInWithGoogle
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Hero */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, position: 'relative' }}>

        {/* Hero glow — radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%) */}
        <View style={{ position: 'absolute', top: '45%', left: '50%', width: 200, height: 200, transform: [{ translateX: -100 }, { translateY: -100 }] }} pointerEvents="none">
          <svg width={200} height={200}>
            <defs>
              <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.07" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx={100} cy={100} rx={100} ry={100} fill="url(#heroGlow)" />
          </svg>
        </View>

        {/* 찰나 로고 — lineHeight 제거로 clipping 방지 */}
        <Text
          style={{
            fontFamily: 'NotoSerifKR_900Black',
            fontSize: 48,
            color: '#0f172a',
            letterSpacing: -2.5,
          }}
        >
          찰나
        </Text>

        {/* 태그라인 */}
        <Text
          style={{
            fontSize: 13,
            color: '#64748b',
            fontWeight: '500',
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 13 * 1.6,
          }}
        >
          {'AI가 매일 정리하는\n트렌드 뉴스 브리핑'}
        </Text>

        {/* 카드 프리뷰 */}
        <View
          style={{
            marginTop: 22,
            width: '100%',
            backgroundColor: '#0b1120',
            borderRadius: 20,
            overflow: 'hidden',
          }}
          onLayout={e => setCardH(e.nativeEvent.layout.height)}
        >
          {/* 배경 radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.5) 0%, transparent 60%) */}
          <svg style={{ position: 'absolute', top: 0, left: 0 }} width={CARD_W} height={cardH}>
            <defs>
              <radialGradient
                id="cardGlow"
                cx={CARD_W * 0.8}
                cy={cardH * 0.2}
                r={CARD_W * 0.7}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={CARD_W} height={cardH} fill="url(#cardGlow)" />
          </svg>

          <View style={{ padding: 13 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '800',
                color: '#fff',
                lineHeight: 13 * 1.3,
                marginBottom: 4,
                letterSpacing: -0.2,
              }}
            >
              오늘의 AI 트렌드
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
                lineHeight: 11 * 1.6,
              }}
            >
              GPT-5 출시 소문과 함께 국내 AI 스타트업 투자가 급증. 삼성·LG도 자체 LLM 개발에 박차를 가하고 있습니다.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.08)',
            borderRadius: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <GoogleLogo />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>
            Google로 시작하기
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 10,
            color: '#94a3b8',
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 10 * 1.5,
          }}
        >
          계속하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </Text>

      </View>
    </SafeAreaView>
  );
}

function GoogleLogo() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

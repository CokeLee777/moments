import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoogleAuth, handleGoogleResponse } from '../lib/auth';

export default function LoginScreen() {
  const { request, response, signIn } = useGoogleAuth();

  useEffect(() => {
    handleGoogleResponse(response);
  }, [response]);

  return (
    <View className="flex-1 bg-white">
      {/* Hero */}
      <View className="flex-1 items-center justify-center px-5">
        <Text
          style={{
            fontFamily: 'NotoSerifKR_900Black',
            fontSize: 48,
            color: '#0f172a',
            letterSpacing: -2.5,
            lineHeight: 48,
          }}
        >
          찰나
        </Text>
        <Text className="text-slate-500 text-[11px] font-medium mt-2 text-center leading-relaxed">
          AI가 매일 정리하는{'\n'}트렌드 뉴스 브리핑
        </Text>

        {/* AI 카드 프리뷰 */}
        <View className="mt-6 w-full rounded-2xl overflow-hidden">
          <LinearGradient
            colors={['rgba(99,102,241,0.5)', 'transparent']}
            start={{ x: 0.8, y: 0.2 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View className="bg-navy p-3.5 rounded-2xl">
            <Text className="text-white text-[10.5px] font-extrabold mb-1 tracking-tight">
              오늘의 AI 트렌드
            </Text>
            <Text className="text-white/50 text-[8px] leading-relaxed font-medium">
              GPT-5 출시 소문과 함께 국내 AI 스타트업 투자가 급증. 삼성·LG도 자체 LLM 개발에 박차를 가하고 있습니다.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="px-4 pb-8">
        <Pressable
          onPress={() => signIn()}
          disabled={!request}
          className="w-full py-3 border border-black/10 rounded-[18px] flex-row items-center justify-center gap-2.5 bg-white shadow-sm active:opacity-80"
        >
          <GoogleLogo />
          <Text className="text-slate-800 font-bold text-[11px]">Google로 시작하기</Text>
        </Pressable>
        <Text className="text-slate-400 text-[7.5px] text-center mt-2 leading-relaxed">
          계속하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </Text>
      </View>
    </View>
  );
}

function GoogleLogo() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

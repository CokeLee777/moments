import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase';
import { getUserProfile, UserProfile } from '../../lib/firestore';
import { signOut } from '../../lib/auth';
import { TOPIC_LABELS } from '../../components/TopicCard';
import { WebAdCard } from '../../components/WebAdCard';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(setProfile);
  }, [user]);

  function handleSignOut() {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="bg-white px-4 pt-1.5 pb-2.5 border-b border-slate-100">
        <Text
          className="font-black text-slate-900"
          style={{ fontSize: 19, letterSpacing: -0.8 }}
        >
          설정
        </Text>
      </View>

      <View className="flex-1 bg-surface p-2.5" style={{ gap: 7 }}>
        {/* 프로필 카드 */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-white font-extrabold text-base">
                {user?.displayName?.[0] ?? 'U'}
              </Text>
            </LinearGradient>
          )}
          <View>
            <Text className="text-[11px] font-bold text-slate-900">
              {user?.displayName}
            </Text>
            <Text style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 1 }}>{user?.email}</Text>
          </View>
        </View>

        {/* 구독 섹션 */}
        <Text style={{ fontSize: 8.5, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', paddingTop: 2, paddingHorizontal: 2 }}>
          구독
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 7 }}>
            <Text className="text-[10px] font-semibold text-slate-800">관심 주제</Text>
            <Pressable onPress={() => router.push('/onboarding?mode=topics' as never)}>
              <Text className="text-[8.5px] font-bold text-primary">변경</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-1.5 flex-wrap">
            {profile?.topics?.map((t) => (
              <View key={t} style={{ backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={{ fontSize: 8.5, fontWeight: '600', color: '#3b82f6' }}>
                  {TOPIC_LABELS[t] ?? t}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 로그아웃 */}
        <Pressable
          onPress={handleSignOut}
          style={{ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.12)', marginTop: 4 }}
        >
          <Text className="text-red-500 font-bold text-[11px]">로그아웃</Text>
        </Pressable>

        {/* 웹 광고 — 로그아웃 버튼 아래 */}
        <WebAdCard />
      </View>
    </SafeAreaView>
  );
}

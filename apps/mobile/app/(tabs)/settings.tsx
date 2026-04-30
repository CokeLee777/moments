import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase';
import { getUserProfile, UserProfile } from '../../lib/firestore';
import { signOut } from '../../lib/auth';
import { TOPIC_LABELS } from '../../components/TopicCard';
import { formatHour } from '../../components/TimeSlot';

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

      <View className="flex-1 bg-surface p-2.5 gap-2">
        {/* 프로필 카드 */}
        <View className="bg-white rounded-2xl p-3 flex-row items-center gap-2.5 border border-black/5">
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
            <Text className="text-[8.5px] text-muted mt-0.5">{user?.email}</Text>
          </View>
        </View>

        {/* 구독 섹션 */}
        <Text className="text-[8.5px] font-bold text-muted uppercase tracking-wider px-0.5 pt-1">
          구독
        </Text>
        <View className="bg-white rounded-[18px] px-3 py-2.5 border border-black/5">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[10px] font-semibold text-slate-800">관심 주제</Text>
            <Pressable onPress={() => router.push('/onboarding?mode=topics' as never)}>
              <Text className="text-[8.5px] font-bold text-primary">변경</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-1.5 flex-wrap">
            {profile?.topics?.map((t) => (
              <View key={t} className="bg-blue-50 rounded-full px-2.5 py-1">
                <Text className="text-[8.5px] font-semibold text-primary">
                  {TOPIC_LABELS[t] ?? t}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 알림 섹션 */}
        <Text className="text-[8.5px] font-bold text-muted uppercase tracking-wider px-0.5 pt-1">
          알림
        </Text>
        <View className="bg-white rounded-[18px] px-3 py-2.5 border border-black/5">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[10px] font-semibold text-slate-800">알림 시간</Text>
            <Pressable onPress={() => router.push('/onboarding?mode=times' as never)}>
              <Text className="text-[8.5px] font-bold text-primary">변경</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-1.5 flex-wrap">
            {profile?.notificationTimes?.map((h) => (
              <View key={h} className="bg-blue-50 rounded-full px-2.5 py-1">
                <Text className="text-[8.5px] font-semibold text-primary">
                  {formatHour(h)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 로그아웃 */}
        <Pressable
          onPress={handleSignOut}
          className="bg-white rounded-[18px] py-3 items-center border mt-1"
          style={{ borderColor: 'rgba(239,68,68,0.12)' }}
        >
          <Text className="text-red-500 font-bold text-[11px]">로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

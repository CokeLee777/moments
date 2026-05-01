import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth } from '../lib/firebase';
import { getUserProfile, updateUserProfile } from '../lib/firestore';
import { TopicCard } from '../components/TopicCard';
import { TimeSlot } from '../components/TimeSlot';
import type { TopicCategory } from '@moments/shared';

const ALL_TOPICS: TopicCategory[] = ['it', 'ai', 'fashion', 'automotive'];
const ALL_HOURS = [5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 23];

type Mode = 'onboard' | 'topics' | 'times';

export default function OnboardingScreen() {
  const { mode = 'onboard' } = useLocalSearchParams<{ mode?: Mode }>();
  const router = useRouter();
  const user = auth.currentUser;

  const isEditMode = mode !== 'onboard';
  const initialStep = mode === 'times' ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  const [selectedTopics, setSelectedTopics] = useState<TopicCategory[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);

  useEffect(() => {
    if (!isEditMode || !user) return;
    getUserProfile(user.uid).then((profile) => {
      if (!profile) return;
      setSelectedTopics(profile.topics ?? []);
      setSelectedTimes(profile.notificationTimes ?? []);
    });
  }, [isEditMode, user]);

  function toggleTopic(id: TopicCategory) {
    setSelectedTopics((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev,
    );
  }

  function toggleTime(hour: number) {
    setSelectedTimes((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : prev.length < 2
        ? [...prev, hour]
        : prev,
    );
  }

  async function handlePrimary() {
    if (!user) return;

    if (mode === 'topics') {
      try { await updateUserProfile(user.uid, { topics: selectedTopics }); } catch { /* ignore */ }
      router.replace('/(tabs)/settings' as never);
      return;
    }

    if (mode === 'times') {
      try { await updateUserProfile(user.uid, { notificationTimes: selectedTimes }); } catch { /* ignore */ }
      router.replace('/(tabs)/settings' as never);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      await updateUserProfile(user.uid, {
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        photoURL: user.photoURL,
        topics: selectedTopics,
        notificationTimes: selectedTimes,
      });
    } catch { /* ignore */ }
    router.replace('/(tabs)');
  }

  const isStep1 = mode === 'topics' || (mode === 'onboard' && step === 1);
  const canProceed = isStep1
    ? selectedTopics.length > 0
    : selectedTimes.length > 0;

  const btnLabel = isEditMode
    ? '저장'
    : step === 1
    ? '다음'
    : '시작하기';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      {isEditMode ? (
        <View className="bg-white border-b border-slate-100 px-4 pt-1.5 pb-2.5">
          <Text
            className="font-black text-slate-900"
            style={{ fontSize: 19, letterSpacing: -0.8 }}
          >
            {mode === 'topics' ? '관심 주제' : '알림 시간'}
          </Text>
          <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '500', marginTop: 3 }}>
            {mode === 'topics' ? '최대 2개 선택' : '하루 최대 2번'}
          </Text>
        </View>
      ) : (
        <View className="bg-white border-b border-slate-100 px-4 pt-3.5 pb-4">
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 10 }}>
            {[1, 2].map((s) => (
              <View
                key={s}
                className={`h-1 rounded-full ${
                  s === step
                    ? 'w-4 bg-primary'
                    : s < step
                    ? 'w-2 bg-primary'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </View>
          <Text
            className="text-slate-900 font-black"
            style={{ fontSize: 18, letterSpacing: -0.7, lineHeight: 18 * 1.25, marginBottom: 3 }}
          >
            {isStep1
              ? '관심 주제를\n선택해주세요'
              : '알림 받을 시간을\n선택해주세요'}
          </Text>
          <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '500' }}>
            {isStep1
              ? '최대 2개까지 선택할 수 있어요'
              : '하루 최대 2번, 원하는 시간에 받아요'}
          </Text>
        </View>
      )}

      {/* 콘텐츠 */}
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 10, paddingBottom: 16 }}
      >
        {isStep1 ? (
          <View className="flex-row flex-wrap gap-2">
            {ALL_TOPICS.map((id) => (
              <View key={id} style={{ width: '48%' }}>
                <TopicCard
                  topicId={id}
                  selected={selectedTopics.includes(id)}
                  onPress={() => toggleTopic(id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-1.5">
            {ALL_HOURS.map((h) => (
              <View key={h} style={{ width: '31%' }}>
                <TimeSlot
                  hour={h}
                  selected={selectedTimes.includes(h)}
                  onPress={() => toggleTime(h)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 footer */}
      <SafeAreaView edges={['bottom']} className="bg-surface">
        <View className="px-2.5 pt-2 pb-3">
          <Pressable
            onPress={handlePrimary}
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.4 }}
          >
            <LinearGradient
              colors={['#3b82f6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>
                {btnLabel}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

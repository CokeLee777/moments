import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../lib/auth-context';
import { updateUserProfile } from '../lib/firestore';
import { TopicCard } from '../components/TopicCard';
import type { TopicCategory } from '@moments/shared';

const ALL_TOPICS: TopicCategory[] = ['it', 'ai', 'fashion', 'automotive'];

type Mode = 'onboard' | 'topics';

export default function OnboardingScreen() {
  const { mode = 'onboard' } = useLocalSearchParams<{ mode?: Mode }>();
  const router = useRouter();
  const { user, profile, setProfile } = useAuth();

  const isEditMode = mode !== 'onboard';

  const [selectedTopics, setSelectedTopics] = useState<TopicCategory[]>([]);

  useEffect(() => {
    if (!isEditMode || !profile) return;
    setSelectedTopics(profile.topics ?? []);
  }, [isEditMode, profile]);

  function toggleTopic(id: TopicCategory) {
    setSelectedTopics((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev,
    );
  }

  async function handlePrimary() {
    if (!user) return;

    if (mode === 'topics') {
      try {
        await updateUserProfile(user.uid, { topics: selectedTopics });
        setProfile(profile ? { ...profile, topics: selectedTopics } : null);
      } catch { /* ignore */ }
      router.replace('/(tabs)/settings' as never);
      return;
    }

    const updated = {
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL,
      topics: selectedTopics,
    };
    try {
      await updateUserProfile(user.uid, updated);
      setProfile(updated);
    } catch { /* ignore */ }
    router.replace('/(tabs)');
  }

  const canProceed = selectedTopics.length > 0;
  const btnLabel = isEditMode ? '저장' : '시작하기';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      {isEditMode ? (
        <View className="bg-white border-b border-slate-100 px-4 pt-1.5 pb-2.5">
          <Text
            className="font-black text-slate-900"
            style={{ fontSize: 19, letterSpacing: -0.8 }}
          >
            관심 주제
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500', marginTop: 3 }}>
            최대 2개 선택
          </Text>
        </View>
      ) : (
        <View className="bg-white border-b border-slate-100 px-4 pt-3.5 pb-4">
          <Text
            className="text-slate-900 font-black"
            style={{ fontSize: 18, letterSpacing: -0.7, lineHeight: 18 * 1.25, marginBottom: 3 }}
          >
            관심 주제를{'\n'}선택해주세요
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>
            최대 2개까지 선택할 수 있어요
          </Text>
        </View>
      )}

      {/* 콘텐츠 */}
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 10, paddingBottom: 16 }}
      >
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
              style={{ borderRadius: 18, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                {btnLabel}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../lib/firebase';
import { getTrendSummary, getUserProfile, UserProfile } from '../../lib/firestore';
import { TrendCard } from '../../components/TrendCard';
import { NewsItem } from '../../components/NewsItem';
import type { TrendSummary } from '@moments/shared';

const TOPIC_LABELS: Record<string, string> = {
  it: 'IT',
  ai: 'AI',
  fashion: '패션',
  automotive: '자동차',
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateKo(): string {
  const d = new Date();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${month}월 ${date}일 ${days[d.getDay()]}`;
}

export default function HomeScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [summary, setSummary] = useState<TrendSummary | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(setProfile);
  }, [user]);

  useEffect(() => {
    if (!profile?.topics?.length) return;
    setSummary(null);
    getTrendSummary(profile.topics[activeIdx], todayStr()).then(setSummary);
  }, [profile, activeIdx]);

  const topics = profile?.topics ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="bg-white px-4 pt-1.5 pb-2.5 flex-row items-center justify-between border-b border-slate-100">
        <Text
          style={{
            fontFamily: 'NotoSerifKR_900Black',
            fontSize: 19,
            color: '#0f172a',
            letterSpacing: -0.8,
            lineHeight: 19,
          }}
        >
          찰나
        </Text>
        <View className="bg-slate-100 rounded-[10px] px-2.5 py-0.5">
          <Text className="text-[8.5px] font-bold text-slate-500">
            {formatDateKo()}
          </Text>
        </View>
      </View>

      {/* 주제 탭 */}
      {topics.length > 0 && (
        <View className="flex-row bg-white border-b border-slate-100 px-1">
          {topics.map((topicId, idx) => (
            <TouchableOpacity
              key={topicId}
              onPress={() => setActiveIdx(idx)}
              className="flex-1 py-2 items-center"
            >
              <Text
                className={`text-[11px] font-semibold ${
                  idx === activeIdx ? 'text-primary' : 'text-muted'
                }`}
              >
                {TOPIC_LABELS[topicId] ?? topicId}
              </Text>
              {idx === activeIdx && (
                <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 본문 */}
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {summary ? (
          <>
            <TrendCard summary={summary} />
            <Text className="text-[8.5px] font-bold text-muted uppercase tracking-wider px-2.5 pb-1.5">
              관련 뉴스
            </Text>
            <View className="px-2.5 gap-1">
              {summary.articles.map((article, i) => (
                <NewsItem key={i} article={article} />
              ))}
            </View>
          </>
        ) : (
          <View className="items-center py-16">
            <Text className="text-muted text-xs">
              아직 오늘의 브리핑이 없어요
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

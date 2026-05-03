import { useEffect, useState, Fragment } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../lib/firebase';
import { getTrendSummary, getUserProfile, UserProfile } from '../../lib/firestore';
import { TrendCard } from '../../components/TrendCard';
import { NewsItem } from '../../components/NewsItem';
import { NativeAdCard } from '../../components/NativeAdCard';
import type { TrendSummary } from '@moments/shared';

const TOPIC_LABELS: Record<string, string> = {
  it: 'IT',
  ai: 'AI',
  fashion: '패션',
  automotive: '자동차',
};

function todayStr() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
          className="font-black text-slate-900"
          style={{ fontSize: 19, letterSpacing: -0.8 }}
        >
          찰나
        </Text>
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 }}>
          <Text style={{ fontSize: 8.5, fontWeight: '700', color: '#64748b', letterSpacing: -0.1 }}>
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
              className="flex-1 pt-2 pb-[7px] items-center"
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
            <Text style={{ fontSize: 8.5, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 10, paddingBottom: 5 }}>
              관련 뉴스
            </Text>
            <View style={{ paddingHorizontal: 10, gap: 4 }}>
              {summary.articles.map((article, i) => (
                <Fragment key={i}>
                  <NewsItem article={article} />
                  {i === 1 && summary.articles.length > 2 && <NativeAdCard />}
                </Fragment>
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

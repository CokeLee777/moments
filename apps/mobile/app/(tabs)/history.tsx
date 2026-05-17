import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import { getRecentTrendSummaries } from '../../lib/firestore';
import { MarkdownText } from '../../components/MarkdownText';
import type { TrendSummary } from '@moments/shared';
import { WebAdCard } from '../../components/WebAdCard';

const TOPIC_DOT_BG: Record<string, string> = {
  ai: '#eff6ff',
  it: '#eff6ff',
  fashion: '#fdf2f8',
  automotive: '#dbeafe',
};

const TOPIC_LABEL: Record<string, string> = {
  ai: 'AI',
  it: 'IT',
  fashion: '패션',
  automotive: '자동차',
};

const TOPIC_BADGE_TEXT: Record<string, string> = {
  ai: '#3b82f6',
  it: '#3b82f6',
  fashion: '#ec4899',
  automotive: '#6366f1',
};

const TOPIC_ICONS: Record<string, string> = {
  ai: '🤖',
  it: '🖥️',
  fashion: '👗',
  automotive: '🚗',
};

function dayKey(dateStr: string): string {
  return new Date(dateStr).toDateString();
}

function groupLabel(dateStr: string): string {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const dk = dayKey(dateStr);
  if (dk === today) return '오늘';
  if (dk === yesterday) return '어제';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  if (h === 0) return `오전 12:${m}`;
  if (h < 12) return `오전 ${h}:${m}`;
  if (h === 12) return `오후 12:${m}`;
  return `오후 ${h - 12}:${m}`;
}

export default function HistoryScreen() {
  const { user, profile } = useAuth();
  const [summaries, setSummaries] = useState<TrendSummary[]>([]);
  const [selected, setSelected] = useState<TrendSummary | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 1.2) {
          setSelected(null);
          translateY.setValue(0);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (selected) translateY.setValue(0);
  }, [selected]);

  useEffect(() => {
    if (!user || !profile?.topics?.length) { setSummaries([]); return; }
    getRecentTrendSummaries(profile.topics).then(setSummaries);
  }, [user, profile]);

  const groups: { label: string; items: TrendSummary[] }[] = [];
  const seen = new Set<string>();
  for (const s of summaries) {
    const label = groupLabel(s.createdAt);
    if (!seen.has(label)) {
      seen.add(label);
      groups.push({ label, items: [] });
    }
    groups[groups.length - 1].items.push(s);
  }

  type FlatItem =
    | { type: 'label'; label: string; key: string }
    | { type: 'item'; item: TrendSummary; key: string }
    | { type: 'ad'; key: string };

  const flat: FlatItem[] = [];
  const totalItems = summaries.length;
  let count = 0;
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    flat.push({ type: 'label', label: group.label, key: `label-${group.label}` });
    for (let ii = 0; ii < group.items.length; ii++) {
      flat.push({ type: 'item', item: group.items[ii], key: group.items[ii].id });
      count += 1;
      const isGroupBoundary = ii === group.items.length - 1 && gi < groups.length - 1;
      const isListEnd = gi === groups.length - 1 && ii === group.items.length - 1;
      if (totalItems >= 5 && count % 5 === 0 && !isGroupBoundary && !isListEnd) {
        flat.push({ type: 'ad', key: `ad-${count}` });
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white px-4 pt-1.5 pb-2.5 border-b border-slate-100">
        <Text className="font-black text-slate-900" style={{ fontSize: 19, letterSpacing: -0.8 }}>
          히스토리
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ padding: 10, gap: 6 }}
      >
        {groups.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-muted text-[13px]">아직 트렌드 브리핑이 없어요</Text>
          </View>
        ) : (
          flat.map((entry) => {
            if (entry.type === 'label') {
              return (
                <Text
                  key={entry.key}
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#94a3b8',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    paddingTop: 4,
                    paddingBottom: 2,
                    paddingHorizontal: 2,
                  }}
                >
                  {entry.label}
                </Text>
              );
            }
            if (entry.type === 'ad') {
              return <WebAdCard key={entry.key} />;
            }
            const item = entry.item;
            return (
              <TouchableOpacity
                key={entry.key}
                activeOpacity={0.7}
                onPress={() => setSelected(item)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 13,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.045)',
                }}
              >
                <View
                  className="w-9 h-9 rounded-[10px] items-center justify-center"
                  style={{ backgroundColor: TOPIC_DOT_BG[item.topicId] ?? '#eff6ff' }}
                >
                  <Text style={{ fontSize: 14 }}>{TOPIC_ICONS[item.topicId] ?? '📰'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#1e293b',
                      lineHeight: 13 * 1.3,
                    }}
                  >
                    {item.title}
                  </Text>
                  <MarkdownText
                    fontSize={12}
                    color="#64748b"
                    lineHeight={12 * 1.55}
                    numberOfLines={3}
                    marginTop={3}
                  >
                    {item.summary}
                  </MarkdownText>
                  <Text
                    style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: '500' }}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setSelected(null)} />
        {selected && (
          <Animated.View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: 40,
              transform: [{ translateY }],
            }}
          >
            <View
              style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}
              {...panResponder.panHandlers}
            >
              <View
                style={{ width: 32, height: 4, backgroundColor: '#cbd5e1', borderRadius: 99 }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>{TOPIC_ICONS[selected.topicId] ?? '📰'}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 99,
                  backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: TOPIC_BADGE_TEXT[selected.topicId] ?? '#3b82f6',
                    letterSpacing: 0.2,
                  }}
                >
                  {TOPIC_LABEL[selected.topicId] ?? selected.topicId}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 }} />

            <ScrollView
              style={{ maxHeight: Dimensions.get('window').height * 0.62 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#0f172a',
                  lineHeight: 15 * 1.4,
                  marginBottom: 10,
                }}
              >
                {selected.title}
              </Text>
              <MarkdownText
                fontSize={13.5}
                color="#475569"
                lineHeight={13.5 * 1.75}
              >
                {selected.summary}
              </MarkdownText>
              <Text
                style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, fontWeight: '500' }}
              >
                {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
              </Text>
            </ScrollView>
          </Animated.View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

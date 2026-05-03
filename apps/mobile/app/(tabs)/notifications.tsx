import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { NativeAdCard } from '../../components/NativeAdCard';

interface NotifRecord {
  id: string;
  title: string;
  body: string;
  topicId: string;
  receivedAt: number;
}

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

function dayKey(ts: number): string {
  return new Date(ts).toDateString();
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  if (h === 0) return `오전 12:${m}`;
  if (h < 12) return `오전 ${h}:${m}`;
  if (h === 12) return `오후 12:${m}`;
  return `오후 ${h - 12}:${m}`;
}

export async function appendNotification(record: NotifRecord) {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db, 'notifications', user.uid, 'items'), {
    title: record.title,
    body: record.body,
    topicId: record.topicId,
    trendId: '',
    createdAt: new Date(record.receivedAt).toISOString(),
    isRead: false,
  });
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function NotificationsScreen() {
  const [records, setRecords] = useState<NotifRecord[]>([]);
  const [selected, setSelected] = useState<NotifRecord | null>(null);
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
    })
  ).current;

  useEffect(() => {
    if (selected) translateY.setValue(0);
  }, [selected]);

  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubFirestore?.();
      if (!user) {
        setRecords([]);
        return;
      }

      const q = query(
        collection(db, 'notifications', user.uid, 'items'),
        orderBy('createdAt', 'desc')
      );

      unsubFirestore = onSnapshot(q, (snap) => {
        setRecords(
          snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title as string,
              body: data.body as string,
              topicId: data.topicId as string,
              receivedAt: new Date(data.createdAt as string).getTime(),
            };
          })
        );
      });
    });

    return () => {
      unsubAuth();
      unsubFirestore?.();
    };
  }, []);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  function groupLabel(ts: number): string {
    const dk = dayKey(ts);
    if (dk === today) return '오늘';
    if (dk === yesterday) return '어제';
    return new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  const groups: { label: string; items: NotifRecord[] }[] = [];
  const seen = new Set<string>();
  for (const r of records) {
    const label = groupLabel(r.receivedAt);
    if (!seen.has(label)) {
      seen.add(label);
      groups.push({ label, items: [] });
    }
    groups[groups.length - 1].items.push(r);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white px-4 pt-1.5 pb-2.5 border-b border-slate-100">
        <Text
          className="font-black text-slate-900"
          style={{ fontSize: 19, letterSpacing: -0.8 }}
        >
          알림
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ padding: 10, gap: 6 }}
      >
        {groups.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-muted text-xs">아직 받은 알림이 없어요</Text>
          </View>
        ) : (
          (() => {
            type FlatItem =
              | { type: 'label'; label: string; key: string }
              | { type: 'item'; item: NotifRecord; key: string }
              | { type: 'ad'; key: string };

            const flat: FlatItem[] = [];
            let itemCount = 0;

            for (const group of groups) {
              flat.push({ type: 'label', label: group.label, key: `label-${group.label}` });
              for (const item of group.items) {
                flat.push({ type: 'item', item, key: item.id });
                itemCount += 1;
                if (itemCount % 5 === 0) {
                  flat.push({ type: 'ad', key: `ad-${itemCount}` });
                }
              }
            }

            return flat.map((entry) => {
              if (entry.type === 'label') {
                return (
                  <Text key={entry.key} style={{ fontSize: 8, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.6, textTransform: 'uppercase', paddingTop: 4, paddingBottom: 2, paddingHorizontal: 2 }}>
                    {entry.label}
                  </Text>
                );
              }
              if (entry.type === 'ad') {
                return <NativeAdCard key={entry.key} />;
              }
              const item = entry.item;
              return (
                <TouchableOpacity
                  key={entry.key}
                  activeOpacity={0.7}
                  onPress={() => setSelected(item)}
                  style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 9, paddingHorizontal: 11, flexDirection: 'row', gap: 9, alignItems: 'flex-start', borderWidth: 1, borderColor: 'rgba(0,0,0,0.045)', marginBottom: 6 }}
                >
                  <View
                    className="w-7 h-7 rounded-[10px] items-center justify-center"
                    style={{ backgroundColor: TOPIC_DOT_BG[item.topicId] ?? '#eff6ff' }}
                  >
                    <Text style={{ fontSize: 14 }}>
                      {TOPIC_ICONS[item.topicId] ?? '🔔'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#1e293b', lineHeight: 9.5 * 1.3 }}>
                      {item.title}
                    </Text>
                    <View style={{ overflow: 'hidden' }}>
                      <Text numberOfLines={3} ellipsizeMode="tail" style={{ fontSize: 8.5, color: '#64748b', lineHeight: 13, marginTop: 2 }}>
                        {item.body}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 3, fontWeight: '500' }}>
                      {formatTime(item.receivedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            });
          })()
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
          <Animated.View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, transform: [{ translateY }] }}>
            {/* 핸들 — 스와이프 다운으로 닫기 */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }} {...panResponder.panHandlers}>
              <View style={{ width: 32, height: 4, backgroundColor: '#cbd5e1', borderRadius: 99 }} />
            </View>

            {/* 헤더 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{TOPIC_ICONS[selected.topicId] ?? '🔔'}</Text>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: TOPIC_DOT_BG[selected.topicId] ?? '#eff6ff' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: TOPIC_BADGE_TEXT[selected.topicId] ?? '#3b82f6', letterSpacing: 0.2 }}>
                  {TOPIC_LABEL[selected.topicId] ?? selected.topicId}
                </Text>
              </View>
            </View>

            {/* 구분선 */}
            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 }} />

            {/* 본문 */}
            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.62 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', lineHeight: 15 * 1.4, marginBottom: 10 }}>{selected.title}</Text>
              <Text style={{ fontSize: 13.5, color: '#475569', lineHeight: 13.5 * 1.75 }}>{selected.body}</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, fontWeight: '500' }}>
                {formatDate(selected.receivedAt)} · {formatTime(selected.receivedAt)}
              </Text>
            </ScrollView>
          </Animated.View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

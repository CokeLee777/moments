import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotifRecord {
  id: string;
  title: string;
  body: string;
  topicId: string;
  receivedAt: number;
}

export const NOTIF_STORAGE_KEY = '@moments/notifications';

const TOPIC_DOT_BG: Record<string, string> = {
  ai: '#eff6ff',
  it: '#eff6ff',
  fashion: '#eff6ff',
  automotive: '#dbeafe',
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
  const raw = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
  const list: NotifRecord[] = raw ? JSON.parse(raw) : [];
  list.unshift(record);
  await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}

export default function NotificationsScreen() {
  const [records, setRecords] = useState<NotifRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_STORAGE_KEY).then((raw) => {
      if (raw) setRecords(JSON.parse(raw));
    });
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
          groups.map((group) => (
            <View key={group.label}>
              <Text className="text-[8px] font-bold text-muted uppercase tracking-wider px-0.5 py-1">
                {group.label}
              </Text>
              {group.items.map((item) => (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl px-3 py-2.5 flex-row gap-2.5 border border-black/5 mb-1.5"
                >
                  <View
                    className="w-7 h-7 rounded-[10px] items-center justify-center"
                    style={{ backgroundColor: TOPIC_DOT_BG[item.topicId] ?? '#eff6ff' }}
                  >
                    <Text style={{ fontSize: 14 }}>
                      {TOPIC_ICONS[item.topicId] ?? '🔔'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[9.5px] font-bold text-slate-800 leading-snug">
                      {item.title}
                    </Text>
                    <Text className="text-[8.5px] text-slate-500 leading-relaxed mt-0.5">
                      {item.body}
                    </Text>
                    <Text className="text-[7.5px] text-muted mt-1 font-medium">
                      {formatTime(item.receivedAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

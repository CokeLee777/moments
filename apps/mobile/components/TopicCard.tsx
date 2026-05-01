import { Pressable, Text } from 'react-native';

export const TOPIC_ICONS: Record<string, string> = {
  it: '🖥️',
  ai: '🤖',
  fashion: '👗',
  automotive: '🚗',
};

export const TOPIC_LABELS: Record<string, string> = {
  it: 'IT/기술',
  ai: '인공지능',
  fashion: '패션',
  automotive: '자동차',
};

interface Props {
  topicId: string;
  selected: boolean;
  onPress: () => void;
}

export function TopicCard({ topicId, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[18px] border py-3.5 px-2.5 items-center gap-1.5 ${
        selected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-black/5'
      }`}
    >
      <Text style={{ fontSize: 22 }}>
        {TOPIC_ICONS[topicId] ?? '📌'}
      </Text>
      <Text
        style={{ fontSize: 9.5, fontWeight: '700', textAlign: 'center', color: selected ? '#3b82f6' : '#475569' }}
      >
        {TOPIC_LABELS[topicId] ?? topicId}
      </Text>
    </Pressable>
  );
}

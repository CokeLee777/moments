import { Pressable, Text, View } from 'react-native';

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
      className={`rounded-[18px] border p-3.5 items-center gap-1.5 ${
        selected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-black/5'
      }`}
    >
      <Text style={{ fontSize: 22 }}>
        {TOPIC_ICONS[topicId] ?? '📌'}
      </Text>
      <Text
        className={`text-[9.5px] font-bold text-center ${
          selected ? 'text-primary' : 'text-slate-500'
        }`}
      >
        {TOPIC_LABELS[topicId] ?? topicId}
      </Text>
    </Pressable>
  );
}

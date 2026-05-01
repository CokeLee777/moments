import { Pressable, Text } from 'react-native';
import { ms } from '../lib/scale';

export function formatHour(hour: number): string {
  if (hour === 0) return '오전 12시';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '오후 12시';
  return `오후 ${hour - 12}시`;
}

interface Props {
  hour: number;
  selected: boolean;
  onPress: () => void;
}

export function TimeSlot({ hour, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 18,
        paddingVertical: 7,
        paddingHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: selected ? '#93c5fd' : 'rgba(0,0,0,0.05)',
        backgroundColor: selected ? '#eff6ff' : '#fff',
      }}
    >
      <Text
        style={{
          fontSize: 8,
          fontWeight: '600',
          color: selected ? '#3b82f6' : '#475569',
        }}
      >
        {formatHour(hour)}
      </Text>
    </Pressable>
  );
}

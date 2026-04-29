import { Pressable, Text } from 'react-native';

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
      className={`rounded-[18px] py-1.5 items-center border ${
        selected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-black/5'
      }`}
    >
      <Text
        className={`text-[8px] font-semibold ${
          selected ? 'text-primary' : 'text-slate-500'
        }`}
      >
        {formatHour(hour)}
      </Text>
    </Pressable>
  );
}

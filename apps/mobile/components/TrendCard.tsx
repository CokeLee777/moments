import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { TrendSummary } from '@moments/shared';

interface Props {
  summary: TrendSummary;
}

export function TrendCard({ summary }: Props) {
  return (
    <View className="mx-2.5 mb-2.5 rounded-2xl overflow-hidden">
      <View className="bg-navy p-3.5 rounded-2xl">
        {/* 배경 그라데이션 — top-right indigo */}
        <LinearGradient
          colors={['rgba(99,102,241,0.55)', 'transparent']}
          start={{ x: 0.85, y: 0.15 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', inset: 0, borderRadius: 20 }}
        />
        {/* 배경 그라데이션 — bottom-left blue */}
        <LinearGradient
          colors={['rgba(59,130,246,0.4)', 'transparent']}
          start={{ x: 0.05, y: 0.85 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', inset: 0, borderRadius: 20 }}
        />

        {/* AI 요약 배지 */}
        <View
          className="flex-row items-center self-start rounded-full px-2 py-0.5 mb-2 gap-1"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.14)',
          }}
        >
          <View className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <Text className="text-white/80 text-[7.5px] font-extrabold uppercase tracking-widest">
            AI 요약
          </Text>
        </View>

        {/* 제목 */}
        <Text
          className="text-white font-extrabold leading-snug mb-1.5"
          style={{ fontSize: 12.5, letterSpacing: -0.3 }}
        >
          {summary.title}
        </Text>

        {/* 요약 본문 */}
        <Text
          className="text-[9px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.68)' }}
        >
          {summary.summary}
        </Text>
      </View>
    </View>
  );
}

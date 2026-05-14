import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Text, View } from 'react-native';
import type { TrendSummary } from '@moments/shared';
import { MarkdownText } from './MarkdownText';
import { ms } from '../lib/scale';

interface Props {
  summary: TrendSummary;
}

const { width: SCREEN_W } = Dimensions.get('window');

export function TrendCard({ summary }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // 초기값을 Dimensions 기반으로 설정해 첫 렌더에서도 그라데이션이 보이도록
  const [cardSize, setCardSize] = useState({ w: SCREEN_W - 20, h: (SCREEN_W - 20) * 0.42 });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View
      className="mx-[10px] mb-[9px] rounded-[20px] overflow-hidden bg-navy"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setCardSize({ w: width, h: height });
      }}
    >
      {/* 배경: SVG radial-gradient(ellipse at 85% 15%, indigo 0%, transparent 55%) + (ellipse at 5% 85%, blue 0%, transparent 50%) */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={cardSize.w}
        height={cardSize.h}
      >
        <defs>
          <radialGradient
            id="trendG1"
            cx={cardSize.w * 0.85}
            cy={cardSize.h * 0.15}
            r={cardSize.w * 0.7}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id="trendG2"
            cx={cardSize.w * 0.05}
            cy={cardSize.h * 0.85}
            r={cardSize.w * 0.65}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={cardSize.w} height={cardSize.h} fill="url(#trendG1)" />
        <rect width={cardSize.w} height={cardSize.h} fill="url(#trendG2)" />
      </svg>

      <View style={{ padding: 13 }}>
        {/* AI 요약 배지 */}
        <View
          className="flex-row items-center self-start rounded-full gap-1"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.14)',
            paddingLeft: 6,
            paddingRight: 8,
            paddingVertical: 2,
            marginBottom: 7,
          }}
        >
          <Animated.View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: '#60a5fa',
              opacity: pulseAnim,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            AI 요약
          </Text>
        </View>

        {/* 제목 */}
        <Text
          className="text-white font-extrabold"
          style={{ fontSize: ms(14), letterSpacing: -0.3, lineHeight: ms(14) * 1.3, marginBottom: 5 }}
        >
          {summary.title}
        </Text>

        {/* 요약 본문 */}
        <MarkdownText
          fontSize={12}
          color="rgba(255,255,255,0.68)"
          lineHeight={12 * 1.65}
          numberOfLines={5}
          boldColor="white"
        >
          {summary.summary}
        </MarkdownText>
      </View>
    </View>
  );
}

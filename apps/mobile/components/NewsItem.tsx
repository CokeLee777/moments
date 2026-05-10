import { Linking, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Article } from '@moments/shared';
import { s, vs } from '../lib/scale';

interface Props {
  article: Article;
}

export function NewsItem({ article }: Props) {
  return (
    <Pressable
      onPress={() => {
        if (article.url) Linking.openURL(article.url).catch(() => {});
      }}
      accessibilityRole="link"
      accessibilityLabel={article.title}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 0,
        paddingRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.045)',
      }}
    >
      {/* 좌측 세로 accent bar */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: s(3), height: vs(44), borderRadius: 4, marginLeft: s(12) }}
      />

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ fontSize: 13, color: '#1e293b', fontWeight: '600', lineHeight: 13 * 1.4 }}
        >
          {article.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <View
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: 4,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <Text style={{ fontSize: 10.5, color: '#64748b', fontWeight: '700' }}>
              {article.source}
            </Text>
          </View>
        </View>
      </View>

      {/* 오른쪽 chevron */}
      <svg
        width={7}
        height={12}
        viewBox="0 0 8 14"
        fill="none"
        style={{ opacity: 0.35 }}
      >
        <path
          d="M1 1l6 6-6 6"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Pressable>
  );
}

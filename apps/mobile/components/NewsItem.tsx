import { Linking, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Article } from '@moments/shared';

interface Props {
  article: Article;
}

export function NewsItem({ article }: Props) {
  return (
    <Pressable
      onPress={() => Linking.openURL(article.url)}
      className="bg-white rounded-[14px] pr-2.5 py-2 flex-row items-center gap-2 border border-black/5 active:opacity-75"
    >
      {/* 좌측 세로 accent bar */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: 3, height: 30, borderRadius: 4, marginLeft: 10 }}
      />

      <View className="flex-1">
        <Text className="text-[9px] text-slate-800 font-semibold leading-snug">
          {article.title}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <View className="bg-slate-100 rounded px-1 py-0.5">
            <Text className="text-[7px] text-slate-500 font-bold">
              {article.source}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-slate-400 text-sm opacity-35">›</Text>
    </Pressable>
  );
}

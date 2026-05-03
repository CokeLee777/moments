import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Path, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { vs, s } from '../../lib/scale';
import { BANNER_AD_UNIT_ID } from '../../lib/adUnits';

function HomeIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={s(16)} height={s(16)} viewBox="0 0 24 24">
      {filled ? (
        <Path d="M12 3L4 9v12h5v-7h6v7h5V9z" fill={color} />
      ) : (
        <Path d="M12 3L4 9v12h5v-7h6v7h5V9z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" fill="none" />
      )}
    </Svg>
  );
}

function BellIcon({ color, filled }: { color: string; filled: boolean }) {
  const d = 'M12 2a7 7 0 0 0-7 7v3.17L3 15v1h18v-1l-2-2.83V9a7 7 0 0 0-7-7zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z';
  return (
    <Svg width={s(16)} height={s(16)} viewBox="0 0 24 24">
      {filled ? (
        <Path d={d} fill={color} />
      ) : (
        <Path d={d} stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </Svg>
  );
}

function PersonIcon({ color, filled }: { color: string; filled: boolean }) {
  const d = 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z';
  return (
    <Svg width={s(16)} height={s(16)} viewBox="0 0 24 24">
      {filled ? (
        <Path d={d} fill={color} />
      ) : (
        <Path d={d} stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: vs(40) + insets.bottom,
            paddingBottom: insets.bottom,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            backgroundColor: '#fff',
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#94a3b8',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: ({ color, focused }) => <HomeIcon color={color} filled={focused} /> }}
        />
        <Tabs.Screen
          name="notifications"
          options={{ tabBarIcon: ({ color, focused }) => <BellIcon color={color} filled={focused} /> }}
        />
        <Tabs.Screen
          name="settings"
          options={{ tabBarIcon: ({ color, focused }) => <PersonIcon color={color} filled={focused} /> }}
        />
      </Tabs>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

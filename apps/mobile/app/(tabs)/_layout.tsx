import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Path, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vs, s } from '../../lib/scale';

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

function ClockIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={s(16)} height={s(16)} viewBox="0 0 24 24">
      {filled ? (
        <>
          <Path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" fill={color} />
          <Path d="M12 7v5l3 3" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <Path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke={color} strokeWidth={1.7} fill="none" />
          <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
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
          name="history"
          options={{ tabBarIcon: ({ color, focused }) => <ClockIcon color={color} filled={focused} /> }}
        />
        <Tabs.Screen
          name="settings"
          options={{ tabBarIcon: ({ color, focused }) => <PersonIcon color={color} filled={focused} /> }}
        />
      </Tabs>
    </View>
  );
}

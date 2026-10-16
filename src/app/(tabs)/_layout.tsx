import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { Platform, type ColorValue } from 'react-native'

import { useTheme } from '@/hooks/use-theme'
import { useStore } from '@/store/store'

type IconName = keyof typeof Ionicons.glyphMap

const icon = (name: IconName, focusedName: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? focusedName : name} size={24} color={color as string} />
  }

export default function TabLayout() {
  const { colors } = useTheme()
  const activeVouchers = useStore((s) => s.vouchers.filter((v) => v.status === 'active').length)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          // Web has no safe-area inset, give labels room above the rounded phone frame corners
          ...(Platform.OS === 'web' && { height: 76, paddingTop: 6, paddingBottom: 12 }),
        },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards', tabBarIcon: icon('gift-outline', 'gift') }} />
      <Tabs.Screen name="flash-sale" options={{ title: 'Flash Sale', tabBarIcon: icon('flash-outline', 'flash') }} />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: icon('wallet-outline', 'wallet'),
          tabBarBadge: activeVouchers || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  )
}

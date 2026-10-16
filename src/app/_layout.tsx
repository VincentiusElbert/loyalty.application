import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ToastProvider } from '@/components/toast'
import { WebFrame } from '@/components/web-frame'
import { useTheme } from '@/hooks/use-theme'

export default function RootLayout() {
  const { colors, isDark } = useTheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WebFrame>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="reward/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="voucher/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </SafeAreaProvider>
      </WebFrame>
    </GestureHandlerRootView>
  )
}

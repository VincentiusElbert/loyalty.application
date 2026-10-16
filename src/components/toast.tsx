import Ionicons from '@expo/vector-icons/Ionicons'
import type React from 'react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/use-theme'

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }

const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  const show = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), message, tone })
    timer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const icon = toast?.tone === 'success' ? 'checkmark-circle' : toast?.tone === 'error' ? 'alert-circle' : 'information-circle'
  const iconColor = toast?.tone === 'success' ? colors.success : toast?.tone === 'error' ? colors.danger : colors.primary

  return (
    <ToastContext.Provider value={show}>
      {children}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top: insets.top + 8 }]}>
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
            <Text style={[styles.text, { color: colors.text }]}>{toast.message}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  )
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    maxWidth: 360,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
})

import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { formatPoints } from '@/lib/format'

type Variant = 'title' | 'heading' | 'body' | 'caption' | 'label'

const variants: Record<Variant, object> = {
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  heading: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
}

export function Text({
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: TextProps & { variant?: Variant; tone?: 'primary' | 'secondary' | 'muted' | 'accent' }) {
  const { colors } = useTheme()
  const color = { primary: colors.text, secondary: colors.textSecondary, muted: colors.muted, accent: colors.primary }[tone]
  return <RNText {...props} style={[variants[variant], { color }, style]} />
}

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const padding = { paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl }
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: colors.background }, padding]}>{children}</View>
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[padding, { gap: space.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>
  )
}

export function haptic(kind: 'tap' | 'success' | 'error' = 'tap') {
  if (Platform.OS === 'web') return
  if (kind === 'tap') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  else Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error)
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: {
  title: string
  onPress: () => void
  icon?: keyof typeof Ionicons.glyphMap
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const bg = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.primarySoft : 'transparent'
  const fg = variant === 'primary' ? colors.onPrimary : colors.primary
  const inactive = disabled || loading

  return (
    <Animated.View style={[animated, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPressIn={() => scale.set(withSpring(0.96))}
        onPressOut={() => scale.set(withSpring(1))}
        onPress={() => {
          haptic('tap')
          onPress()
        }}
        style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.45 : 1 }]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={fg} />}
            <RNText style={[styles.buttonText, { color: fg }]}>{title}</RNText>
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptic('tap')
        onPress()
      }}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <RNText style={{ color: active ? colors.onPrimary : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
        {label}
      </RNText>
    </Pressable>
  )
}

export function PointsPill({ points, size = 'md' }: { points: number; size?: 'sm' | 'md' }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.pill, { backgroundColor: colors.pointsSoft }, size === 'sm' && { paddingVertical: 3 }]}>
      <Ionicons name="star" size={size === 'sm' ? 11 : 13} color={colors.points} />
      <RNText style={{ color: colors.points, fontWeight: '700', fontSize: size === 'sm' ? 12 : 14 }}>
        {formatPoints(points)}
      </RNText>
    </View>
  )
}

// Counts from the previous value to the new one, so point changes feel alive
export function AnimatedPoints({ value, style }: { value: number; style?: TextProps['style'] }) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    const delta = value - start
    if (delta === 0) return
    const began = Date.now()
    const duration = 700
    let frame: number
    const tick = () => {
      const t = Math.min(1, (Date.now() - began) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(start + delta * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      from.current = value
    }
  }, [value])

  return <RNText style={style}>{formatPoints(display)}</RNText>
}

export function IconBadge({ name, color, background, size = 40 }: { name: string; color: string; background: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size * 0.5} color={color} />
    </View>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="heading">{title}</Text>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  button: {
    height: 50,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
})

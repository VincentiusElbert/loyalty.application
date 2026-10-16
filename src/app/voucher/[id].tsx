import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated'

import { useToast } from '@/components/toast'
import { Button, Card, haptic, IconBadge, Screen, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { formatDate } from '@/lib/format'
import { useStore } from '@/store/store'

const SHIPPING_STEPS = [
  { title: 'Order confirmed', icon: 'checkmark-circle' },
  { title: 'Packed at warehouse', icon: 'cube' },
  { title: 'On the way', icon: 'car' },
  { title: 'Delivered', icon: 'home' },
] as const

export default function VoucherDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()
  const { colors } = useTheme()
  const voucher = useStore((s) => s.vouchers.find((v) => v.id === id))
  const markUsed = useStore((s) => s.markVoucherUsed)
  const [now, setNow] = useState(() => Date.now())

  // Re-render every few seconds so the simulated shipping timeline moves forward live
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(timer)
  }, [])

  if (!voucher) {
    return (
      <Screen>
        <Text variant="title">Voucher not found</Text>
      </Screen>
    )
  }

  // Simulated shipping progress: one step per 30 seconds since redemption
  const step = Math.min(SHIPPING_STEPS.length - 1, Math.floor((now - voucher.createdAt) / 30_000))
  const used = voucher.status === 'used'

  return (
    <Screen>
      <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { backgroundColor: colors.surface }]}>
        <Ionicons name="close" size={22} color={colors.text} />
      </Pressable>

      <View style={{ alignItems: 'center', gap: space.sm }}>
        <IconBadge name={voucher.icon} color={colors.primary} background={colors.primarySoft} size={56} />
        <Text variant="heading" style={{ textAlign: 'center' }}>
          {voucher.name}
        </Text>
        <Text variant="caption" tone="muted">
          Redeemed {formatDate(voucher.createdAt)}
        </Text>
      </View>

      {voucher.kind === 'evoucher' ? (
        <Animated.View entering={ZoomIn.springify()}>
          <Card style={styles.qrCard}>
            <View style={[styles.qrBox, used && { opacity: 0.25 }]}>
              <QRCode value={`collect://voucher/${voucher.code}`} size={196} backgroundColor="#FFFFFF" color="#14121F" />
            </View>
            {used && (
              <View style={[styles.usedBadge, { backgroundColor: colors.surface }]}>
                <Text variant="label" tone="secondary">
                  Used
                </Text>
              </View>
            )}
            <Text variant="label" tone="muted">
              Voucher code
            </Text>
            <Text style={styles.code}>{voucher.code}</Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              Show this QR code at the cashier, or enter the code at checkout.
            </Text>
          </Card>
        </Animated.View>
      ) : (
        <Card style={{ gap: space.lg }}>
          <Text variant="label" tone="muted">
            Order {voucher.code}
          </Text>
          {SHIPPING_STEPS.map((s, i) => {
            const done = i <= step
            return (
              <Animated.View key={s.title} entering={FadeInDown.delay(i * 80)} style={styles.stepRow}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.dot, { backgroundColor: done ? colors.success : colors.surfaceAlt }]}>
                    <Ionicons name={s.icon} size={14} color={done ? '#fff' : colors.muted} />
                  </View>
                  {i < SHIPPING_STEPS.length - 1 && (
                    <View style={[styles.line, { backgroundColor: i < step ? colors.success : colors.surfaceAlt }]} />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: space.md }}>
                  <Text style={{ fontWeight: done ? '700' : '500' }} tone={done ? 'primary' : 'muted'}>
                    {s.title}
                  </Text>
                  {i === step && (
                    <Text variant="caption" tone="secondary">
                      Latest update
                    </Text>
                  )}
                </View>
              </Animated.View>
            )
          })}
        </Card>
      )}

      {voucher.kind === 'evoucher' && !used && (
        <Button
          title="Mark as used"
          variant="secondary"
          icon="checkmark-done"
          onPress={() => {
            markUsed(voucher.id)
            haptic('success')
            toast('Voucher marked as used', 'success')
          }}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  qrCard: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  qrBox: { padding: space.md, backgroundColor: '#FFFFFF', borderRadius: radius.md, marginBottom: space.md },
  usedBadge: { position: 'absolute', top: 110, paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.pill },
  code: { fontFamily: 'monospace', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  stepRow: { flexDirection: 'row', gap: space.md },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
})

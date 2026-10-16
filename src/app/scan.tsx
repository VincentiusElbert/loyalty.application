import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  cancelAnimation,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated'

import { Button, Card, haptic, IconBadge, Screen, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { CAMPAIGN, SAMPLE_RECEIPTS } from '@/lib/catalog'
import { formatIDR, formatPoints } from '@/lib/format'
import { useStore } from '@/store/store'

type Phase = 'pick' | 'verifying' | 'done'

export default function ScanScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const scanned = useStore((s) => s.scannedReceipts)
  const scanReceipt = useStore((s) => s.scanReceipt)
  const [phase, setPhase] = useState<Phase>('pick')
  const [earned, setEarned] = useState(0)

  // Scanning line sweeping over the receipt while it is "verified"
  const sweep = useSharedValue(0)
  useEffect(() => {
    if (phase === 'verifying') sweep.set(withRepeat(withTiming(1, { duration: 900 }), -1, true))
    else cancelAnimation(sweep)
  }, [phase, sweep])
  const line = useAnimatedStyle(() => ({ top: `${sweep.value * 92}%` }))

  const submit = async (id: string, store: string, amount: number) => {
    setPhase('verifying')
    const points = await scanReceipt(id, store, amount)
    haptic('success')
    setEarned(points)
    setPhase('done')
  }

  return (
    <Screen>
      <View style={styles.top}>
        <Text variant="title">Scan receipt</Text>
        <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
      </View>

      {phase === 'pick' && (
        <Animated.View entering={FadeIn} style={{ gap: space.md }}>
          <Text tone="secondary">
            In the real app you’d take a photo of your receipt. For this demo, pick a sample receipt. Every Rp1.000
            spent earns 1 point{CAMPAIGN.active ? `, doubled during "${CAMPAIGN.title}"` : ''}.
          </Text>
          {SAMPLE_RECEIPTS.map((r) => {
            const done = scanned.includes(r.id)
            const base = Math.floor(r.amount / 1000)
            const pts = CAMPAIGN.active ? base * CAMPAIGN.multiplier : base
            return (
              <Pressable key={r.id} disabled={done} onPress={() => submit(r.id, r.store, r.amount)} accessibilityRole="button">
                <Card style={[styles.receipt, done && { opacity: 0.5 }]}>
                  <IconBadge name="receipt" color={colors.primary} background={colors.primarySoft} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700' }}>{r.store}</Text>
                    <Text variant="caption" tone="secondary">
                      {formatIDR(r.amount)}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: '700', color: done ? colors.muted : colors.success }}>
                    {done ? 'Scanned' : `+${formatPoints(pts)}`}
                  </Text>
                </Card>
              </Pressable>
            )
          })}
        </Animated.View>
      )}

      {phase === 'verifying' && (
        <Animated.View entering={FadeIn} style={styles.center}>
          <View style={[styles.paper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[70, 90, 55, 80, 60, 85, 40].map((w, i) => (
              <View key={i} style={[styles.paperLine, { width: `${w}%`, backgroundColor: colors.surfaceAlt }]} />
            ))}
            <Animated.View style={[styles.scanLine, { backgroundColor: colors.primary }, line]} />
          </View>
          <Text variant="heading">Verifying receipt…</Text>
          <Text tone="secondary" style={{ textAlign: 'center' }}>
            Reading the store, date and total, and checking it hasn’t been used before.
          </Text>
        </Animated.View>
      )}

      {phase === 'done' && (
        <Animated.View entering={FadeIn} style={styles.center}>
          <Animated.View entering={ZoomIn.springify()} style={[styles.check, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </Animated.View>
          <Text variant="title">+{formatPoints(earned)} points</Text>
          <Text tone="secondary" style={{ textAlign: 'center' }}>
            Receipt verified{CAMPAIGN.active ? ` with the ${CAMPAIGN.multiplier}x campaign bonus` : ''}. Your balance is
            updated.
          </Text>
          <Button title="Done" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
          <Button title="Scan another" variant="ghost" onPress={() => setPhase('pick')} style={{ alignSelf: 'stretch' }} />
        </Animated.View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  receipt: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  center: { alignItems: 'center', gap: space.lg, paddingTop: space.xl },
  paper: { width: 200, height: 240, borderRadius: radius.md, borderWidth: 1, padding: space.lg, gap: space.md, overflow: 'hidden' },
  paperLine: { height: 10, borderRadius: 5 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, opacity: 0.8 },
  check: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
})

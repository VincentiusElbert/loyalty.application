import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated'

import { useToast } from '@/components/toast'
import { Button, Card, haptic, IconBadge, PointsPill, Screen, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { ERROR_MESSAGES, newIdempotencyKey, tierFor } from '@/lib/api'
import { REWARDS, TIERS } from '@/lib/catalog'
import { formatPoints } from '@/lib/format'
import { useStore } from '@/store/store'

export default function RewardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()
  const { colors } = useTheme()
  const { points, lifetimePoints, stock, redeem } = useStore()
  const [step, setStep] = useState<'view' | 'confirm' | 'done'>('view')
  const [loading, setLoading] = useState(false)
  const [voucherId, setVoucherId] = useState<string | null>(null)
  // One key per redemption attempt: retries of the same attempt can never charge twice
  const key = useRef(newIdempotencyKey())

  const reward = REWARDS.find((r) => r.id === id)
  if (!reward) {
    return (
      <Screen>
        <Text variant="title">Reward not found</Text>
      </Screen>
    )
  }

  const left = stock[reward.id] ?? 0
  const tier = tierFor(lifetimePoints)
  const locked = reward.minTier && TIERS.findIndex((t) => t.name === tier) < TIERS.findIndex((t) => t.name === reward.minTier)
  const affordable = points >= reward.cost
  const blocker = left <= 0 ? 'Sold out' : locked ? `${reward.minTier} tier required` : !affordable ? 'Not enough points' : null

  const confirm = async () => {
    setLoading(true)
    const res = await redeem({ itemId: reward.id, source: 'catalog', idempotencyKey: key.current })
    setLoading(false)
    if (res.ok) {
      haptic('success')
      setVoucherId(res.voucher.id)
      setStep('done')
    } else {
      haptic('error')
      toast(ERROR_MESSAGES[res.error], 'error')
      key.current = newIdempotencyKey()
      setStep('view')
    }
  }

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <PointsPill points={points} />
      </View>

      {step === 'done' ? (
        <Animated.View entering={FadeIn} style={styles.done}>
          <Animated.View entering={ZoomIn.springify()} style={[styles.check, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </Animated.View>
          <Text variant="title" style={{ textAlign: 'center' }}>
            Reward redeemed!
          </Text>
          <Text tone="secondary" style={{ textAlign: 'center' }}>
            {reward.kind === 'evoucher'
              ? 'Your e-voucher is ready in your wallet.'
              : "We'll ship it to your address. Track it in your wallet."}
          </Text>
          <Button
            title="Open in wallet"
            icon="wallet"
            onPress={() => {
              router.back()
              if (voucherId) router.push({ pathname: '/voucher/[id]', params: { id: voucherId } })
            }}
            style={{ alignSelf: 'stretch' }}
          />
          <Button title="Back to rewards" variant="ghost" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </Animated.View>
      ) : (
        <>
          <View style={[styles.art, { backgroundColor: colors.primarySoft }]}>
            <IconBadge name={reward.icon} color={colors.primary} background={colors.surface} size={88} />
          </View>

          <View style={{ gap: space.sm }}>
            <Text variant="label" tone="accent">
              {reward.category} · {reward.kind === 'evoucher' ? 'E-voucher' : 'Shipped to you'}
            </Text>
            <Text variant="title">{reward.name}</Text>
            <Text tone="secondary">{reward.description}</Text>
          </View>

          <Card style={{ gap: space.md }}>
            <Row label="Cost" value={`${formatPoints(reward.cost)} pts`} />
            <Row label="Your balance" value={`${formatPoints(points)} pts`} />
            <Row
              label="After redeeming"
              value={affordable ? `${formatPoints(points - reward.cost)} pts` : '-'}
              strong
            />
            <Row label="Stock" value={left > 0 ? `${left} left` : 'Sold out'} />
            {reward.minTier && <Row label="Minimum tier" value={reward.minTier} />}
          </Card>

          {step === 'confirm' ? (
            <Animated.View entering={FadeIn} style={{ gap: space.sm }}>
              <Text tone="secondary" style={{ textAlign: 'center' }}>
                Spend {formatPoints(reward.cost)} points on this reward?
              </Text>
              <Button title="Confirm redemption" icon="checkmark-circle" loading={loading} onPress={confirm} />
              <Button title="Cancel" variant="ghost" disabled={loading} onPress={() => setStep('view')} />
            </Animated.View>
          ) : (
            <Button
              title={blocker ?? 'Redeem reward'}
              icon={blocker ? 'lock-closed' : 'gift'}
              disabled={!!blocker}
              onPress={() => setStep('confirm')}
            />
          )}
        </>
      )}
    </Screen>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text tone="secondary">{label}</Text>
      <Text style={{ fontWeight: strong ? '700' : '600' }}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  art: { height: 200, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  done: { alignItems: 'center', gap: space.lg, paddingTop: space.xxl },
  check: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
})

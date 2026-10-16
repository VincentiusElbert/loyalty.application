import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import Animated, { FadeInDown, FadeInLeft, LinearTransition } from 'react-native-reanimated'

import { useToast } from '@/components/toast'
import { Button, Card, haptic, IconBadge, PointsPill, Screen, SectionHeader, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { ERROR_MESSAGES, newIdempotencyKey, tierFor, type RedeemResponse } from '@/lib/api'
import { FLASH_ITEMS, TIERS, type FlashItem } from '@/lib/catalog'
import { formatCountdown, formatPoints } from '@/lib/format'
import { useStore } from '@/store/store'

type LogEntry = { id: string; label: string; key: string; status: number; note: string; ok: boolean }

export default function FlashSaleScreen() {
  const { colors } = useTheme()
  const flashEndsAt = useStore((s) => s.flashEndsAt)
  const points = useStore((s) => s.points)
  const [now, setNow] = useState(() => Date.now())
  const [doubleTap, setDoubleTap] = useState(true)
  const [log, setLog] = useState<LogEntry[]>([])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = flashEndsAt - now
  const addLog = (entries: LogEntry[]) => setLog((l) => [...entries, ...l].slice(0, 8))

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">Flash Sale</Text>
        <PointsPill points={points} />
      </View>

      <Animated.View entering={FadeInDown}>
        <Card style={[styles.timer, { backgroundColor: colors.dangerSoft, borderColor: 'transparent' }]}>
          <Ionicons name="flash" size={22} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }}>{remaining > 0 ? 'Ends in' : 'Flash sale ended'}</Text>
            <Text variant="caption" tone="secondary">
              Limited stock · one item per member
            </Text>
          </View>
          <Text style={[styles.countdown, { color: colors.danger }]}>{formatCountdown(remaining)}</Text>
        </Card>
      </Animated.View>

      {FLASH_ITEMS.map((item, i) => (
        <Animated.View key={item.id} entering={FadeInDown.delay(80 * (i + 1))}>
          <FlashCard item={item} doubleTap={doubleTap} ended={remaining <= 0} onLog={addLog} />
        </Animated.View>
      ))}

      <Card style={{ gap: space.md }}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }}>Simulate double tap</Text>
            <Text variant="caption" tone="secondary">
              Sends the same request twice, like an impatient tap or a network retry. The idempotency key makes sure
              you are only charged once.
            </Text>
          </View>
          <Switch
            value={doubleTap}
            onValueChange={setDoubleTap}
            trackColor={{ true: colors.primary, false: colors.surfaceAlt }}
            thumbColor="#fff"
            accessibilityLabel="Simulate double tap"
          />
        </View>
      </Card>

      <SectionHeader title="Request log" />
      <Card style={{ gap: space.sm }}>
        {log.length === 0 ? (
          <Text variant="caption" tone="muted">
            Claim an item to see the API requests here.
          </Text>
        ) : (
          log.map((entry) => (
            <Animated.View key={entry.id} entering={FadeInLeft} layout={LinearTransition} style={styles.logRow}>
              <View style={[styles.status, { backgroundColor: entry.ok ? colors.successSoft : colors.dangerSoft }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: entry.ok ? colors.success : colors.danger }}>
                  {entry.status}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" style={{ fontWeight: '600' }}>
                  {entry.label}
                </Text>
                <Text variant="caption" tone="muted" style={styles.mono}>
                  {entry.key} · {entry.note}
                </Text>
              </View>
            </Animated.View>
          ))
        )}
      </Card>
    </Screen>
  )
}

function FlashCard({
  item,
  doubleTap,
  ended,
  onLog,
}: {
  item: FlashItem
  doubleTap: boolean
  ended: boolean
  onLog: (e: LogEntry[]) => void
}) {
  const { colors } = useTheme()
  const toast = useToast()
  const { stock, flashClaims, lifetimePoints, points, redeem } = useStore()
  const [loading, setLoading] = useState(false)

  const left = stock[item.id] ?? 0
  const claimed = flashClaims.includes(item.id)
  const tier = tierFor(lifetimePoints)
  const eligible = TIERS.findIndex((t) => t.name === tier) >= TIERS.findIndex((t) => t.name === item.minTier)
  const soldShare = 1 - left / item.stock

  const claim = async () => {
    setLoading(true)
    const key = newIdempotencyKey()
    const send = () => redeem({ itemId: item.id, source: 'flash', idempotencyKey: key })
    const requests = doubleTap ? [send(), send()] : [send()]
    const results = await Promise.all(requests)
    setLoading(false)

    onLog(
      results
        .map((r: RedeemResponse, i) => ({
          id: `${key}-${i}`,
          label: `#${i + 1} POST /flash-sale/redeem · ${item.name}`,
          key: key.slice(0, 16),
          status: r.status,
          ok: r.ok,
          note: r.replayed ? 'replayed, not charged again' : r.ok ? 'created' : r.error,
        }))
        .reverse(),
    )

    const first = results[0]
    if (first.ok) {
      haptic('success')
      toast(
        doubleTap ? `Claimed! 2 requests sent, charged once (${formatPoints(item.cost)} pts).` : 'Claimed! Check your wallet.',
        'success',
      )
    } else {
      haptic('error')
      toast(ERROR_MESSAGES[first.error], 'error')
    }
  }

  const label = ended
    ? 'Sale ended'
    : claimed
      ? 'Claimed'
      : left <= 0
        ? 'Sold out'
        : !eligible
          ? `${item.minTier} only`
          : points < item.cost
            ? 'Not enough points'
            : 'Claim now'

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.itemRow}>
        <IconBadge name={item.icon} color={colors.primary} background={colors.primarySoft} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <View style={styles.prices}>
            <PointsPill points={item.cost} size="sm" />
            <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through' }}>
              {formatPoints(item.originalCost)}
            </Text>
          </View>
          {item.minTier !== 'Silver' && (
            <Text variant="caption" tone={eligible ? 'muted' : 'accent'}>
              {item.minTier} members and above
            </Text>
          )}
        </View>
      </View>

      <View>
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.fill, { width: `${soldShare * 100}%`, backgroundColor: colors.danger }]} />
        </View>
        <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
          {left > 0 ? `${left} of ${item.stock} left` : 'All claimed'}
        </Text>
      </View>

      <Button
        title={label}
        icon={claimed ? 'checkmark-circle' : 'flash'}
        variant={label === 'Claim now' ? 'primary' : 'secondary'}
        disabled={label !== 'Claim now'}
        loading={loading}
        onPress={claim}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  countdown: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  prices: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  status: { width: 40, paddingVertical: 4, borderRadius: 6, alignItems: 'center' },
  mono: { fontFamily: 'monospace', fontSize: 11 },
})

import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'

import { Button, Chip, IconBadge, Screen, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import type { Voucher } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useStore } from '@/store/store'

const FILTERS = ['Active', 'Shipping', 'Used'] as const

export default function WalletScreen() {
  const router = useRouter()
  const vouchers = useStore((s) => s.vouchers)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Active')

  // Active = everything not used yet (e-vouchers and shipped rewards), matching the tab badge
  const shown = vouchers.filter((v) =>
    filter === 'Used' ? v.status === 'used' : filter === 'Shipping' ? v.kind === 'physical' : v.status === 'active',
  )

  return (
    <Screen>
      <Text variant="title">Wallet</Text>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      {shown.length === 0 ? (
        <EmptyState filter={filter} onBrowse={() => router.push('/rewards')} />
      ) : (
        <Animated.View layout={LinearTransition} style={{ gap: space.md }}>
          {shown.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(i * 50)} layout={LinearTransition}>
              <VoucherCard voucher={v} onPress={() => router.push({ pathname: '/voucher/[id]', params: { id: v.id } })} />
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </Screen>
  )
}

function VoucherCard({ voucher, onPress }: { voucher: Voucher; onPress: () => void }) {
  const { colors } = useTheme()
  const used = voucher.status === 'used'

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.ticket,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: used ? 0.55 : pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.stub, { backgroundColor: colors.primarySoft }]}>
        <IconBadge name={voucher.icon} color={colors.primary} background={colors.surface} size={44} />
      </View>
      {/* Perforation between stub and body */}
      <View style={[styles.notchTop, { backgroundColor: colors.background }]} />
      <View style={[styles.notchBottom, { backgroundColor: colors.background }]} />
      <View style={styles.body}>
        <Text style={{ fontWeight: '700' }} numberOfLines={1}>
          {voucher.name}
        </Text>
        <Text variant="caption" tone="muted">
          {voucher.kind === 'physical' ? 'Shipped reward' : 'E-voucher'} · {formatDate(voucher.createdAt)}
        </Text>
        <View style={styles.meta}>
          <Text variant="caption" style={styles.code}>
            {voucher.kind === 'physical' ? 'Order ' : ''}
            {voucher.code}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>
      </View>
    </Pressable>
  )
}

function EmptyState({ filter, onBrowse }: { filter: string; onBrowse: () => void }) {
  const { colors } = useTheme()
  return (
    <View style={styles.empty}>
      <IconBadge name="wallet" color={colors.primary} background={colors.primarySoft} size={72} />
      <Text variant="heading">No {filter.toLowerCase()} rewards yet</Text>
      <Text tone="secondary" style={{ textAlign: 'center' }}>
        Redeem a reward or claim a flash sale item and it will show up here.
      </Text>
      <Button title="Browse rewards" icon="gift" onPress={onBrowse} />
    </View>
  )
}

const styles = StyleSheet.create({
  ticket: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  stub: { width: 84, alignItems: 'center', justifyContent: 'center' },
  notchTop: { position: 'absolute', left: 74, top: -10, width: 20, height: 20, borderRadius: 10 },
  notchBottom: { position: 'absolute', left: 74, bottom: -10, width: 20, height: 20, borderRadius: 10 },
  body: { flex: 1, padding: space.lg, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  code: { fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1 },
  empty: { alignItems: 'center', gap: space.md, paddingTop: space.xxl, paddingHorizontal: space.lg },
})

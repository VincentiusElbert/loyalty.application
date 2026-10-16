import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'

import { Chip, IconBadge, PointsPill, Screen, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { tierFor } from '@/lib/api'
import { CATEGORIES, REWARDS, TIERS, type Reward } from '@/lib/catalog'
import { useStore } from '@/store/store'

export default function RewardsScreen() {
  const [category, setCategory] = useState<string>('All')
  const points = useStore((s) => s.points)
  const items = category === 'All' ? REWARDS : REWARDS.filter((r) => r.category === category)

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">Rewards</Text>
        <PointsPill points={points} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {['All', ...CATEGORIES].map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <Animated.View layout={LinearTransition} style={styles.grid}>
        {items.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </Animated.View>
    </Screen>
  )
}

function RewardCard({ reward }: { reward: Reward }) {
  const { colors } = useTheme()
  const router = useRouter()
  const { points, lifetimePoints, stock } = useStore()
  const left = stock[reward.id] ?? 0
  const tier = tierFor(lifetimePoints)
  const locked = reward.minTier && TIERS.findIndex((t) => t.name === tier) < TIERS.findIndex((t) => t.name === reward.minTier)
  const affordable = points >= reward.cost

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition} style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${reward.name}, ${reward.cost} points`}
        onPress={() => router.push({ pathname: '/reward/[id]', params: { id: reward.id } })}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.art, { backgroundColor: colors.primarySoft }]}>
          <IconBadge name={reward.icon} color={colors.primary} background={colors.surface} size={48} />
          {locked && (
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Ionicons name="lock-closed" size={11} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary" style={{ fontSize: 11, fontWeight: '600' }}>
                {reward.minTier}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontWeight: '600' }} numberOfLines={2}>
          {reward.name}
        </Text>
        <View style={styles.footer}>
          <PointsPill points={reward.cost} size="sm" />
          <Text variant="caption" tone={left <= 5 ? 'accent' : 'muted'} style={{ fontSize: 11 }}>
            {left <= 0 ? 'Sold out' : `${left} left`}
          </Text>
        </View>
        {!affordable && !locked && left > 0 && (
          <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
            Need {(reward.cost - points).toLocaleString('en-US')} more
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space.xs },
  cell: { width: '50%', padding: space.xs },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.md, gap: space.sm },
  art: { height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})

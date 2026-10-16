import Ionicons from '@expo/vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { cardGradient, radius, space } from '@/constants/theme'
import { tierFor } from '@/lib/api'
import { TIERS } from '@/lib/catalog'
import { formatPoints } from '@/lib/format'
import { AnimatedPoints } from './ui'

export function PointsCard({ points, lifetimePoints, memberId }: { points: number; lifetimePoints: number; memberId: string }) {
  const tier = tierFor(lifetimePoints)
  const index = TIERS.findIndex((t) => t.name === tier)
  const next = TIERS[index + 1]
  const floor = TIERS[index].minLifetime
  const progress = next ? (lifetimePoints - floor) / (next.minLifetime - floor) : 1

  const width = useSharedValue(0)
  useEffect(() => {
    width.set(withTiming(Math.min(1, progress), { duration: 900 }))
  }, [progress, width])
  const bar = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }))

  return (
    <LinearGradient colors={cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Available points</Text>
        <View style={styles.tier}>
          <Ionicons name="diamond" size={12} color="#fff" />
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      </View>

      <View style={styles.pointsRow}>
        <Ionicons name="star" size={26} color="#FFD36B" />
        <AnimatedPoints value={points} style={styles.points} />
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, bar]} />
      </View>
      <Text style={styles.caption}>
        {next
          ? `${formatPoints(next.minLifetime - lifetimePoints)} lifetime points to ${next.name}`
          : 'You reached the highest tier'}
      </Text>

      <Text style={styles.memberId}>{memberId}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: space.xl, gap: space.sm, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tierText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.xs },
  points: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', marginTop: space.sm },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  memberId: { color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 1.5, marginTop: space.md },
})

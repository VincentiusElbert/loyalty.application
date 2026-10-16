import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'

import { PointsCard } from '@/components/points-card'
import { Card, IconBadge, Screen, SectionHeader, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { CAMPAIGN } from '@/lib/catalog'
import { formatPoints, timeAgo } from '@/lib/format'
import { useStore, type Activity } from '@/store/store'

export default function HomeScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { memberName, memberId, points, lifetimePoints, activity } = useStore()

  const actions = [
    { label: 'Scan receipt', icon: 'scan', onPress: () => router.push('/scan') },
    { label: 'Rewards', icon: 'gift', onPress: () => router.push('/rewards') },
    { label: 'Flash sale', icon: 'flash', onPress: () => router.push('/flash-sale') },
    { label: 'Invite', icon: 'people', onPress: () => router.push('/profile') },
  ] as const

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text variant="caption" tone="secondary">
            Good to see you,
          </Text>
          <Text variant="title">{memberName.split(' ')[0]} 👋</Text>
        </View>
        <Pressable
          accessibilityLabel="Profile"
          onPress={() => router.push('/profile')}
          style={[styles.avatar, { backgroundColor: colors.primarySoft }]}
        >
          <Text variant="heading" tone="accent">
            {memberName
              .split(' ')
              .map((p) => p[0])
              .join('')}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <PointsCard points={points} lifetimePoints={lifetimePoints} memberId={memberId} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.actions}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={a.onPress} style={styles.action} accessibilityRole="button">
            <IconBadge name={a.icon} color={colors.primary} background={colors.primarySoft} size={52} />
            <Text variant="caption" tone="secondary" style={{ fontWeight: '600' }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {CAMPAIGN.active && (
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Pressable onPress={() => router.push('/scan')}>
            <Card style={[styles.campaign, { backgroundColor: colors.pointsSoft, borderColor: 'transparent' }]}>
              <IconBadge name="sparkles" color={colors.points} background={colors.surface} />
              <View style={{ flex: 1 }}>
                <Text variant="heading" style={{ fontSize: 16 }}>
                  {CAMPAIGN.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {CAMPAIGN.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.points} />
            </Card>
          </Pressable>
        </Animated.View>
      )}

      <SectionHeader title="Recent activity" />
      <Card style={{ paddingVertical: space.xs }}>
        {activity.slice(0, 6).map((item, i) => (
          <ActivityRow key={item.id} item={item} last={i === Math.min(activity.length, 6) - 1} />
        ))}
      </Card>
    </Screen>
  )
}

function ActivityRow({ item, last }: { item: Activity; last: boolean }) {
  const { colors } = useTheme()
  const positive = item.points > 0
  const iconName = item.kind === 'earn' ? 'receipt' : item.kind === 'bonus' ? 'people' : 'gift'

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeInDown}
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <IconBadge
        name={iconName}
        color={positive ? colors.success : colors.textSecondary}
        background={positive ? colors.successSoft : colors.surfaceAlt}
        size={36}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="caption" tone="muted">
          {timeAgo(item.at)}
        </Text>
      </View>
      <Text style={{ fontWeight: '700', color: positive ? colors.success : colors.text }}>
        {positive ? '+' : '−'}
        {formatPoints(Math.abs(item.points))}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: space.sm, flex: 1 },
  campaign: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
})

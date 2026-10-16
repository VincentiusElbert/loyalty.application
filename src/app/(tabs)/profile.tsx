import Ionicons from '@expo/vector-icons/Ionicons'
import { Alert, Platform, Pressable, Share, StyleSheet, View } from 'react-native'

import { useToast } from '@/components/toast'
import { Button, Card, haptic, IconBadge, Screen, SectionHeader, Text } from '@/components/ui'
import { radius, space } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { tierFor } from '@/lib/api'
import { REFERRAL_BONUS, TIERS } from '@/lib/catalog'
import { formatPoints } from '@/lib/format'
import { useStore } from '@/store/store'

const THEMES = [
  { value: 'system', label: 'System', icon: 'phone-portrait' },
  { value: 'light', label: 'Light', icon: 'sunny' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
] as const

export default function ProfileScreen() {
  const { colors } = useTheme()
  const toast = useToast()
  const s = useStore()
  const tier = tierFor(s.lifetimePoints)

  const share = async () => {
    const message = `Join Collect with my code ${s.referralCode} and we both get ${REFERRAL_BONUS} points!`
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard?.writeText(message)
        toast('Invite message copied to clipboard', 'success')
      } else {
        await Share.share({ message })
      }
    } catch {
      // user dismissed the share sheet
    }
  }

  const reset = () => {
    const run = () => {
      s.resetDemo()
      haptic('success')
      toast('Demo data reset', 'success')
    }
    if (Platform.OS === 'web') run()
    else
      Alert.alert('Reset demo?', 'Points, vouchers and activity go back to the starting state.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: run },
      ])
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text variant="title" style={{ color: colors.onPrimary }}>
            {s.memberName
              .split(' ')
              .map((p) => p[0])
              .join('')}
          </Text>
        </View>
        <Text variant="title">{s.memberName}</Text>
        <Text variant="caption" tone="muted">
          Member {s.memberId}
        </Text>
      </View>

      <SectionHeader title="Membership tiers" />
      <Card style={{ gap: space.md }}>
        {TIERS.map((t) => {
          const current = t.name === tier
          const reached = s.lifetimePoints >= t.minLifetime
          return (
            <View key={t.name} style={styles.tierRow}>
              <IconBadge
                name="diamond"
                color={reached ? colors.primary : colors.muted}
                background={reached ? colors.primarySoft : colors.surfaceAlt}
                size={36}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{t.name}</Text>
                <Text variant="caption" tone="muted">
                  {formatPoints(t.minLifetime)}+ lifetime points
                </Text>
              </View>
              {current && (
                <View style={[styles.current, { backgroundColor: colors.primarySoft }]}>
                  <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
                    Current
                  </Text>
                </View>
              )}
            </View>
          )
        })}
        <Text variant="caption" tone="secondary">
          You’ve earned {formatPoints(s.lifetimePoints)} lifetime points. Higher tiers unlock exclusive rewards and flash
          sale items.
        </Text>
      </Card>

      <SectionHeader title="Invite friends" />
      <Card style={{ gap: space.md }}>
        <Text tone="secondary">
          Share your code. When a friend joins, you both get {formatPoints(REFERRAL_BONUS)} points.
        </Text>
        <Pressable onPress={share} style={[styles.code, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}>
          <Text style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: 20, letterSpacing: 2, color: colors.primary }}>
            {s.referralCode}
          </Text>
          <Ionicons name="share-outline" size={20} color={colors.primary} />
        </Pressable>
        <View style={styles.statsRow}>
          <Text variant="caption" tone="secondary">
            {s.referrals} {s.referrals === 1 ? 'friend' : 'friends'} joined
          </Text>
          <Text variant="caption" tone="secondary">
            {formatPoints(s.referrals * REFERRAL_BONUS)} pts earned
          </Text>
        </View>
        <Button
          title="Simulate a friend joining"
          variant="secondary"
          icon="person-add"
          onPress={() => {
            s.inviteFriend()
            haptic('success')
            toast(`A friend joined! +${REFERRAL_BONUS} points`, 'success')
          }}
        />
      </Card>

      <SectionHeader title="Appearance" />
      <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
        {THEMES.map((t) => {
          const active = s.themePreference === t.value
          return (
            <Pressable
              key={t.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => s.setThemePreference(t.value)}
              style={[styles.segmentItem, active && { backgroundColor: colors.surface }]}
            >
              <Ionicons name={t.icon} size={16} color={active ? colors.primary : colors.muted} />
              <Text variant="caption" style={{ fontWeight: '600', color: active ? colors.text : colors.muted }}>
                {t.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Button title="Reset demo data" variant="ghost" icon="refresh" onPress={reset} />
      <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
        Collect is a demo app. All members, rewards and data are fictional.
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: space.xs, paddingVertical: space.md },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  current: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  code: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingVertical: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.md },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
})

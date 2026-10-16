import Ionicons from '@expo/vector-icons/Ionicons'
import type React from 'react'
import { Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

// On a wide browser window, show the app inside a phone frame with a short
// project description next to it. On phones (and native) the app is full screen.
export function WebFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions()
  if (Platform.OS !== 'web' || width < 900) return <>{children}</>

  const phoneHeight = Math.min(844, height - 64)
  const phoneWidth = Math.round(phoneHeight * (390 / 844))

  return (
    <View style={styles.page}>
      <View style={styles.intro}>
        <View style={styles.logoRow}>
          <View style={styles.logo}>
            <Ionicons name="star" size={20} color="#fff" />
          </View>
          <Text style={styles.brand}>Collect</Text>
        </View>
        <Text style={styles.title}>A loyalty rewards app, built with Expo.</Text>
        <Text style={styles.body}>
          Earn points from receipts, redeem rewards, join flash sales, and keep vouchers in a wallet. Redemption is
          duplicate-safe: try the double-tap demo on the Flash Sale tab.
        </Text>
        <View style={styles.tags}>
          {['Expo', 'React Native', 'TypeScript', 'Expo Router', 'Reanimated', 'Zustand'].map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
        </View>
        <Text style={styles.note}>
          Runs on iOS and Android too. All data is fictional and stays on your device.
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL('https://github.com/VincentiusElbert/loyalty.application')}
          style={styles.link}
        >
          <Ionicons name="logo-github" size={18} color="#F3F1FA" />
          <Text style={styles.linkText}>View the code</Text>
        </Pressable>
      </View>

      <View style={[styles.phone, { width: phoneWidth, height: phoneHeight }]}>
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 72,
    backgroundColor: '#0B0914',
    paddingHorizontal: 32,
  },
  intro: { maxWidth: 420, gap: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#6D4AFF', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#F3F1FA', fontSize: 20, fontWeight: '800' },
  title: { color: '#F3F1FA', fontSize: 40, fontWeight: '800', letterSpacing: -1, lineHeight: 46 },
  body: { color: '#B7B3C9', fontSize: 16, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    color: '#C9BDFF',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(140,112,255,0.14)',
  },
  note: { color: '#857F9E', fontSize: 13 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  linkText: { color: '#F3F1FA', fontWeight: '600' },
  phone: {
    borderRadius: 48,
    padding: 12,
    backgroundColor: '#1E1B2B',
    shadowColor: '#6D4AFF',
    shadowOpacity: 0.35,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 20 },
  },
  screen: { flex: 1, borderRadius: 38, overflow: 'hidden', backgroundColor: '#000' },
})

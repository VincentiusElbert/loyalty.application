import { useColorScheme } from 'react-native'

import { palette, type Palette } from '@/constants/theme'
import { useStore } from '@/store/store'

export function useTheme(): { colors: Palette; isDark: boolean } {
  const system = useColorScheme()
  const preference = useStore((s) => s.themePreference)
  const isDark = preference === 'system' ? system === 'dark' : preference === 'dark'
  return { colors: isDark ? palette.dark : palette.light, isDark }
}

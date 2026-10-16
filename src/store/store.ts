import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  latency,
  processRedemption,
  type RedeemRequest,
  type RedeemResponse,
  type ServerState,
  type Voucher,
} from '@/lib/api'
import { CAMPAIGN, FLASH_ITEMS, FLASH_SALE_DURATION_MS, REFERRAL_BONUS, REWARDS } from '@/lib/catalog'

export type Activity = {
  id: string
  kind: 'earn' | 'redeem' | 'bonus'
  title: string
  points: number
  at: number
}

type ThemePreference = 'system' | 'light' | 'dark'

type State = ServerState & {
  memberName: string
  memberId: string
  referralCode: string
  activity: Activity[]
  vouchers: Voucher[]
  scannedReceipts: string[]
  referrals: number
  themePreference: ThemePreference
}

type Actions = {
  redeem: (req: RedeemRequest) => Promise<RedeemResponse>
  scanReceipt: (receiptId: string, store: string, amount: number) => Promise<number>
  inviteFriend: () => void
  markVoucherUsed: (id: string) => void
  setThemePreference: (t: ThemePreference) => void
  resetDemo: () => void
}

const DAY = 86_400_000

function initialState(): State {
  const now = Date.now()
  const stock: Record<string, number> = {}
  for (const r of REWARDS) stock[r.id] = r.stock
  for (const f of FLASH_ITEMS) stock[f.id] = f.stock

  return {
    memberName: 'Alya Putri',
    memberId: 'CLT-2048-7731',
    referralCode: 'ALYA-7731',
    points: 12_450,
    lifetimePoints: 18_200,
    stock,
    flashClaims: [],
    flashEndsAt: now + FLASH_SALE_DURATION_MS,
    processed: {},
    activity: [
      { id: 'a1', kind: 'earn', title: 'Receipt · FreshMart Kemang', points: 320, at: now - 2 * 3_600_000 },
      { id: 'a2', kind: 'bonus', title: 'Referral bonus · Dimas joined', points: REFERRAL_BONUS, at: now - DAY },
      { id: 'a3', kind: 'redeem', title: 'Ride credit Rp25.000', points: -800, at: now - 3 * DAY },
      { id: 'a4', kind: 'earn', title: 'Receipt · Daily Grocer', points: 180, at: now - 5 * DAY },
    ],
    vouchers: [],
    scannedReceipts: [],
    referrals: 1,
    themePreference: 'system',
  }
}

// Requests currently in flight, keyed by idempotency key. A second identical request
// (double tap, retry) waits for the first one instead of being processed again.
const inflight = new Map<string, Promise<RedeemResponse>>()

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      redeem: (req) => {
        const running = inflight.get(req.idempotencyKey)
        if (running) return running.then((r) => ({ ...r, replayed: true }))

        const promise = (async () => {
          await latency()
          const { response, patch } = processRedemption(get(), req)
          if (patch) set(patch)
          if (response.ok && !response.replayed) {
            const { voucher } = response
            set((s) => ({
              vouchers: [voucher, ...s.vouchers],
              activity: [
                { id: `a_${Date.now()}`, kind: 'redeem', title: voucher.name, points: -voucher.cost, at: Date.now() },
                ...s.activity,
              ],
            }))
          }
          return response
        })()

        inflight.set(req.idempotencyKey, promise)
        promise.finally(() => inflight.delete(req.idempotencyKey))
        return promise
      },

      scanReceipt: async (receiptId, store, amount) => {
        await latency(1200, 1800) // "verifying" the receipt
        const base = Math.floor(amount / 1000)
        const earned = CAMPAIGN.active ? base * CAMPAIGN.multiplier : base
        set((s) => ({
          points: s.points + earned,
          lifetimePoints: s.lifetimePoints + earned,
          scannedReceipts: [...s.scannedReceipts, receiptId],
          activity: [
            {
              id: `a_${Date.now()}`,
              kind: 'earn',
              title: `Receipt · ${store}${CAMPAIGN.active ? ` (${CAMPAIGN.multiplier}x)` : ''}`,
              points: earned,
              at: Date.now(),
            },
            ...s.activity,
          ],
        }))
        return earned
      },

      inviteFriend: () =>
        set((s) => ({
          referrals: s.referrals + 1,
          points: s.points + REFERRAL_BONUS,
          lifetimePoints: s.lifetimePoints + REFERRAL_BONUS,
          activity: [
            {
              id: `a_${Date.now()}`,
              kind: 'bonus',
              title: 'Referral bonus · friend joined',
              points: REFERRAL_BONUS,
              at: Date.now(),
            },
            ...s.activity,
          ],
        })),

      markVoucherUsed: (id) =>
        set((s) => ({ vouchers: s.vouchers.map((v) => (v.id === id ? { ...v, status: 'used' } : v)) })),

      setThemePreference: (themePreference) => set({ themePreference }),

      resetDemo: () => set({ ...initialState(), themePreference: get().themePreference }),
    }),
    {
      name: 'collect-demo',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

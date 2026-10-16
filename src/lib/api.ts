// A tiny in-app "backend" so the demo behaves like a real API:
// simulated latency, validation rules, stock, and idempotent redemption.

import { FLASH_ITEMS, REWARDS, TIERS, type RewardKind, type Tier } from './catalog'

export type ApiError =
  | 'INSUFFICIENT_POINTS'
  | 'OUT_OF_STOCK'
  | 'TIER_REQUIRED'
  | 'ALREADY_CLAIMED'
  | 'SALE_ENDED'
  | 'NOT_FOUND'

export const ERROR_MESSAGES: Record<ApiError, string> = {
  INSUFFICIENT_POINTS: "You don't have enough points for this reward yet.",
  OUT_OF_STOCK: 'This reward just sold out.',
  TIER_REQUIRED: 'Your tier is too low for this reward.',
  ALREADY_CLAIMED: 'Flash sale items are limited to one per member.',
  SALE_ENDED: 'This flash sale has ended.',
  NOT_FOUND: 'Reward not found.',
}

export type RedeemRequest = {
  itemId: string
  source: 'catalog' | 'flash'
  idempotencyKey: string
}

export type Voucher = {
  id: string
  itemId: string
  name: string
  icon: string
  kind: RewardKind
  cost: number
  code: string
  status: 'active' | 'used'
  createdAt: number
}

export type RedeemResponse =
  | { ok: true; status: 201; voucher: Voucher; replayed: boolean }
  | { ok: false; status: 409 | 422; error: ApiError; replayed: boolean }

export type ServerState = {
  points: number
  lifetimePoints: number
  stock: Record<string, number>
  flashClaims: string[]
  flashEndsAt: number
  processed: Record<string, RedeemResponse>
}

export function tierFor(lifetimePoints: number): Tier {
  let tier: Tier = 'Silver'
  for (const t of TIERS) if (lifetimePoints >= t.minLifetime) tier = t.name
  return tier
}

const tierRank = (t: Tier) => TIERS.findIndex((x) => x.name === t)

export const latency = (min = 450, max = 900) =>
  new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)))

export const newIdempotencyKey = () => `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

function voucherCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CLT-${block()}-${block()}`
}

// Pure business rules: given the server state and a request, decide the outcome.
// Returns the response plus the state changes to apply.
export function processRedemption(
  state: ServerState,
  req: RedeemRequest,
  now = Date.now(),
): { response: RedeemResponse; patch?: Partial<ServerState> } {
  // Idempotency: the same key always returns the first response, nothing is charged twice
  const previous = state.processed[req.idempotencyKey]
  if (previous) return { response: { ...previous, replayed: true } }

  const item =
    req.source === 'flash' ? FLASH_ITEMS.find((f) => f.id === req.itemId) : REWARDS.find((r) => r.id === req.itemId)

  const fail = (error: ApiError, status: 409 | 422 = 422) => {
    const response: RedeemResponse = { ok: false, status, error, replayed: false }
    return { response, patch: { processed: { ...state.processed, [req.idempotencyKey]: response } } }
  }

  if (!item) return fail('NOT_FOUND')
  if (req.source === 'flash' && now > state.flashEndsAt) return fail('SALE_ENDED')
  if (req.source === 'flash' && state.flashClaims.includes(item.id)) return fail('ALREADY_CLAIMED', 409)

  const minTier = 'minTier' in item ? item.minTier : undefined
  if (minTier && tierRank(tierFor(state.lifetimePoints)) < tierRank(minTier)) return fail('TIER_REQUIRED')
  if ((state.stock[item.id] ?? 0) <= 0) return fail('OUT_OF_STOCK', 409)
  if (state.points < item.cost) return fail('INSUFFICIENT_POINTS')

  const voucher: Voucher = {
    id: `v_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    itemId: item.id,
    name: item.name,
    icon: item.icon,
    kind: item.kind,
    cost: item.cost,
    code: voucherCode(),
    status: 'active',
    createdAt: now,
  }
  const response: RedeemResponse = { ok: true, status: 201, voucher, replayed: false }

  return {
    response,
    patch: {
      points: state.points - item.cost,
      stock: { ...state.stock, [item.id]: (state.stock[item.id] ?? 0) - 1 },
      flashClaims: req.source === 'flash' ? [...state.flashClaims, item.id] : state.flashClaims,
      processed: { ...state.processed, [req.idempotencyKey]: response },
    },
  }
}

// All data in this app is fictional and exists only for the demo.

export type Tier = 'Silver' | 'Gold' | 'Platinum'

export const TIERS: { name: Tier; minLifetime: number }[] = [
  { name: 'Silver', minLifetime: 0 },
  { name: 'Gold', minLifetime: 10_000 },
  { name: 'Platinum', minLifetime: 25_000 },
]

export type RewardCategory = 'Vouchers' | 'Merch' | 'Experiences' | 'Donations'
export type RewardKind = 'evoucher' | 'physical'

export type Reward = {
  id: string
  name: string
  description: string
  category: RewardCategory
  kind: RewardKind
  cost: number
  stock: number
  icon: string // Ionicons name
  minTier?: Tier
}

export const CATEGORIES: RewardCategory[] = ['Vouchers', 'Merch', 'Experiences', 'Donations']

export const REWARDS: Reward[] = [
  {
    id: 'coffee-50k',
    name: 'Coffee voucher Rp50.000',
    description: 'Redeem at partner coffee shops across Indonesia. Valid for 30 days.',
    category: 'Vouchers',
    kind: 'evoucher',
    cost: 1_500,
    stock: 120,
    icon: 'cafe',
  },
  {
    id: 'grocery-100k',
    name: 'Grocery voucher Rp100.000',
    description: 'Use it at partner supermarkets for your weekly shop. Valid for 30 days.',
    category: 'Vouchers',
    kind: 'evoucher',
    cost: 2_800,
    stock: 80,
    icon: 'basket',
  },
  {
    id: 'ride-credit',
    name: 'Ride credit Rp25.000',
    description: 'Credit for your next ride or food delivery order.',
    category: 'Vouchers',
    kind: 'evoucher',
    cost: 800,
    stock: 300,
    icon: 'car-sport',
  },
  {
    id: 'tumbler',
    name: 'Collect tumbler',
    description: 'Stainless steel 500ml tumbler that keeps drinks cold for 12 hours. Shipped to your address.',
    category: 'Merch',
    kind: 'physical',
    cost: 4_500,
    stock: 25,
    icon: 'beer',
  },
  {
    id: 'tote',
    name: 'Canvas tote bag',
    description: 'Sturdy everyday tote made from recycled canvas. Shipped to your address.',
    category: 'Merch',
    kind: 'physical',
    cost: 3_200,
    stock: 40,
    icon: 'bag-handle',
  },
  {
    id: 'cinema',
    name: 'Cinema tickets for two',
    description: 'Two regular tickets at partner cinemas, any day of the week.',
    category: 'Experiences',
    kind: 'evoucher',
    cost: 5_000,
    stock: 30,
    icon: 'film',
    minTier: 'Gold',
  },
  {
    id: 'cooking-class',
    name: 'Family cooking class',
    description: 'A weekend cooking class for one adult and one child in Jakarta.',
    category: 'Experiences',
    kind: 'evoucher',
    cost: 12_000,
    stock: 6,
    icon: 'restaurant',
    minTier: 'Platinum',
  },
  {
    id: 'donate-meals',
    name: 'Donate 10 school meals',
    description: 'We turn your points into 10 nutritious school meals through a partner foundation.',
    category: 'Donations',
    kind: 'evoucher',
    cost: 1_000,
    stock: 999,
    icon: 'heart',
  },
]

export type FlashItem = {
  id: string
  name: string
  originalCost: number
  cost: number
  stock: number
  icon: string
  kind: RewardKind
  minTier: Tier
}

// The flash sale window, measured from the moment the app first opens
export const FLASH_SALE_DURATION_MS = 2 * 60 * 60 * 1000

export const FLASH_ITEMS: FlashItem[] = [
  { id: 'flash-coffee', name: 'Coffee voucher Rp50.000', originalCost: 1_500, cost: 500, stock: 12, icon: 'cafe', kind: 'evoucher', minTier: 'Silver' },
  { id: 'flash-earbuds', name: 'Wireless earbuds', originalCost: 15_000, cost: 6_000, stock: 3, icon: 'headset', kind: 'physical', minTier: 'Gold' },
  { id: 'flash-hotel', name: 'Weekend hotel stay', originalCost: 40_000, cost: 20_000, stock: 1, icon: 'bed', kind: 'evoucher', minTier: 'Platinum' },
]

// Receipts a member can "scan" in the demo. Points = spend / 1,000 (x campaign multiplier)
export const SAMPLE_RECEIPTS = [
  { id: 'r1', store: 'FreshMart Kemang', amount: 245_000 },
  { id: 'r2', store: 'Daily Grocer Bandung', amount: 128_500 },
  { id: 'r3', store: 'Pantry & Co. Surabaya', amount: 412_000 },
]

// Campaign config, like a value an admin toggles in a CMS without an app release
export const CAMPAIGN = {
  active: true,
  title: '2X points weekend',
  description: 'Every scanned receipt earns double points until Sunday.',
  multiplier: 2,
}

export const REFERRAL_BONUS = 500

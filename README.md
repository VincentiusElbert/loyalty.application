# Collect: Loyalty Rewards

A loyalty rewards mobile app built with Expo (React Native). It runs on iOS, Android and the web.

All members, rewards and data are fictional. Everything stays on your device.

## Features

- **Points wallet:** an animated balance, tier progress (Silver, Gold, Platinum) and recent activity
- **Receipt scanning:** a simulated verification flow that awards points, with a configurable 2x campaign multiplier
- **Rewards catalog:** category filters, tier-locked rewards, live stock and a confirmation step before redeeming
- **Flash sale:** a countdown, limited stock, tier eligibility and one item per member
- **Duplicate-safe redemption:** every redemption carries an idempotency key. Turn on "Simulate double tap" on the Flash Sale tab to send the same request twice and watch the request log: the first is created, the second is replayed and not charged again.
- **Wallet:** e-vouchers with QR codes, and a delivery timeline for shipped rewards
- **Referrals:** a shareable code, with a bonus when a friend joins
- **Light and dark themes**, haptic feedback on native, and screen reader labels

## How redemption works

`src/lib/api.ts` is a small in-app "backend":

- `processRedemption()` is a pure function holding the business rules: sale window, one-per-member, tier, stock and balance. It returns the response plus the state changes to apply.
- Responses are stored by idempotency key, so repeating a request returns the original response.
- Requests that are still in flight are tracked too. A second identical request waits for the first one instead of being processed in parallel.

## Tech stack

Expo SDK 57 (the version supported by Expo Go), Expo Router, TypeScript, React Native Reanimated, Zustand (persisted with AsyncStorage), react-native-svg and react-native-qrcode-svg.

## Getting started

Requires Node.js 22.13 or newer.

```bash
npm install
npx expo start
```

Then press `w` for the web, or scan the QR code with the Expo Go app on your phone.

## Deploy the web version

```bash
npx expo export -p web
```

The static site is written to `dist/`. `vercel.json` is already set up for Vercel.

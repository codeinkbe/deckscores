# DeckScores

A Klaverjas score-tracking app. Mobile (Expo) + landing page (Next.js) + shared types, in a Turborepo monorepo.

## Structure

- `apps/mobile` — Expo + React Native app (Expo Router, Clerk auth)
- `apps/web` — Next.js landing page + API routes (MongoDB via Mongoose, Clerk auth)
- `packages/shared` — Shared TypeScript types and Klaverjas scoring logic

## Develop

```bash
pnpm install
pnpm dev
```

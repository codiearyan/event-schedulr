# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm dev              # Run all apps + backend concurrently
pnpm dev:web          # Web app only (http://localhost:3001)
pnpm dev:native       # Native app only (Expo)
pnpm dev:server       # Convex backend only
pnpm dev:setup        # Initial Convex configuration (first time setup)

pnpm build            # Build all packages
pnpm check-types      # Type-check all packages
pnpm check            # Biome lint and format (with auto-fix)
```

Native-specific (from `apps/native`):
```bash
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
```

Adding shadcn/ui components (from `apps/web`):
```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

This is a pnpm + Turborepo monorepo for an event management app with real-time sync.

### Apps
- **`apps/web`**: React 19 + TanStack Start (SSR) + TanStack Router + Tailwind + shadcn/ui
- **`apps/native`**: React Native + Expo + Expo Router + heroui-native + uniwind

### Packages
- **`packages/backend`**: Convex serverless functions + database schema + better-auth
- **`packages/env`**: Environment variable validation (Zod schemas)
- **`packages/config`**: Shared TypeScript configuration

### Key Patterns
- **Routing**: TanStack Router (web) uses file-based routes in `apps/web/src/routes/`. Expo Router (native) uses file-based routes in `apps/native/app/`.
- **Backend**: Convex functions in `packages/backend/convex/`. Queries auto-subscribe to changes. Mutations are transactional. Actions handle side effects.
- **Auth**: better-auth configured in `packages/backend/convex/auth.ts`. Client utilities in each app's `lib/auth-client.ts`.
- **State**: Zustand for client state, TanStack Query + Convex hooks for server state.

## Code Conventions

- **No comments**: Code should be self-documenting
- **No `any` types**: Use proper TypeScript types
- **Validation**: Use Zod for runtime validation
- **Formatting**: Biome handles linting and formatting (run `pnpm check`)

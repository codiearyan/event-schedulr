# EventSchedulr - Agent Guidelines

> Keep every attendee in sync.

## Project Description

EventSchedulr is an event management application designed to streamline communication between organizers, volunteers/mentors, and participants. The platform provides:

- **Web Interface**: For organizers and volunteers/mentors to create events, upload schedules, and manage the entire event lifecycle
- **Mobile App**: A unified interface for all users (organizers, volunteers, and participants) to receive real-time updates and stay synchronized

### Key Features

- Event creation and management (organizers)
- Schedule uploading and updates
- Real-time notifications and updates for participants
- Role-based access (organizer, volunteer/mentor, participant)

---

## Tech Stack

### Monorepo Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| pnpm | 10.23.0 | Package manager with workspaces |
| Turborepo | ^2.6.3 | Monorepo build orchestration |
| Biome | ^2.2.0 | Linting and formatting |
| TypeScript | latest | Type safety |

### Web Application (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI framework |
| Vite | ^7.0.2 | Build tool and dev server |
| TanStack Start | ^1.141.1 | SSR framework |
| TanStack Router | ^1.141.1 | Type-safe routing |
| TanStack Query | ^5.80.6 | Server state management |
| TanStack Form | ^1.23.5 | Form handling |
| Tailwind CSS | ^4.1.3 | Styling |
| shadcn/ui | ^3.6.2 | UI component library |
| Base UI | ^1.0.0 | Unstyled components |
| Lucide React | ^0.525.0 | Icons |

### Native Application (`apps/native`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | ^54.0.23 | Development platform |
| Expo Router | ~6.0.14 | File-based routing |
| React Native Reanimated | ~4.1.1 | Animations |
| React Native Gesture Handler | ^2.28.0 | Gestures |
| heroui-native | ^1.0.0-beta.9 | UI components |
| uniwind | ^1.2.2 | Tailwind-like styling |
| Tailwind CSS | ^4.1.18 | Styling |

### Backend (`packages/backend`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Convex | latest | Real-time database & serverless functions |
| better-auth | latest | Authentication |
| Zod | latest | Schema validation |

### Shared Packages

| Package | Purpose |
|---------|---------|
| `@event-schedulr/backend` | Shared Convex backend |
| `@event-schedulr/env` | Environment configuration |
| `@event-schedulr/config` | Shared TypeScript config |

---

## File Structure

```
event-schedulr/
├── apps/
│   ├── web/                          # Web application
│   │   ├── public/
│   │   │   └── robots.txt
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── checkbox.tsx
│   │   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── label.tsx
│   │   │   │   │   ├── skeleton.tsx
│   │   │   │   │   └── sonner.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── loader.tsx
│   │   │   │   ├── sign-in-form.tsx
│   │   │   │   ├── sign-up-form.tsx
│   │   │   │   └── user-menu.tsx
│   │   │   ├── lib/
│   │   │   │   ├── auth-client.ts
│   │   │   │   ├── auth-server.ts
│   │   │   │   └── utils.ts
│   │   │   ├── routes/
│   │   │   │   ├── api/
│   │   │   │   │   └── auth/
│   │   │   │   │       └── $.ts       # Auth API handler
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── todos.tsx
│   │   │   ├── index.css
│   │   │   └── router.tsx
│   │   ├── .env
│   │   ├── components.json           # shadcn/ui config
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── native/                       # React Native application
│       ├── app/
│       │   ├── (drawer)/
│       │   │   ├── (tabs)/
│       │   │   │   ├── _layout.tsx
│       │   │   │   ├── index.tsx
│       │   │   │   └── two.tsx
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx
│       │   │   └── todos.tsx
│       │   ├── +not-found.tsx
│       │   ├── _layout.tsx
│       │   └── modal.tsx
│       ├── assets/
│       │   └── images/               # App icons and images
│       ├── components/
│       │   ├── container.tsx
│       │   ├── sign-in.tsx
│       │   ├── sign-up.tsx
│       │   └── theme-toggle.tsx
│       ├── contexts/
│       │   └── app-theme-context.tsx
│       ├── lib/
│       │   └── auth-client.ts
│       ├── .env
│       ├── app.json                  # Expo config
│       ├── global.css
│       ├── metro.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── backend/                      # Convex backend
│   │   ├── convex/
│   │   │   ├── _generated/           # Auto-generated Convex files
│   │   │   ├── auth.config.ts
│   │   │   ├── auth.ts
│   │   │   ├── convex.config.ts
│   │   │   ├── healthCheck.ts
│   │   │   ├── http.ts
│   │   │   ├── privateData.ts
│   │   │   ├── schema.ts
│   │   │   ├── todos.ts
│   │   │   └── tsconfig.json
│   │   ├── .env.local
│   │   └── package.json
│   │
│   ├── config/                       # Shared configuration
│   │   ├── package.json
│   │   └── tsconfig.base.json
│   │
│   └── env/                          # Environment utilities
│       ├── src/
│       │   ├── native.ts
│       │   ├── server.ts
│       │   └── web.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── package.json                      # Root package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json                        # Turborepo config
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├─────────────────────────────┬───────────────────────────────┤
│         Web App             │         Native App            │
│    (React + TanStack)       │    (React Native + Expo)      │
│    - Organizer dashboard    │    - All user types           │
│    - Volunteer portal       │    - Real-time updates        │
└─────────────────────────────┴───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Convex)                          │
├─────────────────────────────────────────────────────────────┤
│  • Real-time database subscriptions                          │
│  • Serverless functions (queries, mutations, actions)        │
│  • Authentication (better-auth)                              │
│  • Schema validation (Zod)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Guidelines

### Code Style

- Use Biome for linting and formatting (`pnpm check`)
- Follow TypeScript strict mode
- Use Zod for runtime validation
- **No comments**: Code should be self-documenting; avoid writing comments
- **No `any` types**: Always use proper TypeScript types; never use `any`
- **Clean code**: Write readable, maintainable code that's easy to update
- **Security first**: Follow security best practices, validate inputs, sanitize outputs

### State Management

- **Client State**: Zustand for local/UI state (both web and native)
- **Server State**: TanStack Query (web), Convex React hooks (both)
- **Forms**: TanStack Form (web)
- **Routing**: TanStack Router (web), Expo Router (native)

### Authentication

- Implemented via `better-auth` library
- Shared auth configuration in `packages/backend/convex/auth.ts`
- Client-side auth utilities in respective `lib/auth-client.ts` files

### UI Components

**Web (apps/web)**: Always prefer **shadcn/ui** components for building UI. Before creating custom components, check if a shadcn component exists that can be used or composed.

```bash
cd apps/web
pnpm dlx shadcn@latest add <component-name>
```

**Native (apps/native)**: Use **heroui-native** components with **uniwind** for styling.

### Convex Functions

- **Queries**: Read-only operations, auto-subscribe to changes
- **Mutations**: Write operations, transactional
- **Actions**: Side effects, external API calls

---

## Environment Variables

### Web (`apps/web/.env`)

```env
VITE_CONVEX_URL=<your-convex-url>
# Auth-related variables
```

### Native (`apps/native/.env`)

```env
EXPO_PUBLIC_CONVEX_URL=<your-convex-url>
# Auth-related variables
```

### Backend (`packages/backend/.env.local`)

```env
# Convex deployment variables
# Auth secrets
```

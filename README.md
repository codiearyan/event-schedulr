# EventSchedulr

> Keep every attendee in sync.

An event management application that provides a web interface for organizers and volunteers/mentors, and a mobile app for all users including organizers, volunteers, and participants. Organizers can create events, upload schedules, and manage the entire event, while participants receive real-time updates through the app.

## Features

- **Event Management**: Create and manage events with full control over schedules and updates
- **Role-Based Access**: Separate interfaces for organizers, volunteers/mentors, and participants
- **Real-Time Updates**: Instant notifications and schedule changes pushed to all attendees
- **Cross-Platform**: Web dashboard for management, mobile app for on-the-go access

## Tech Stack

- **TypeScript** - Type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **React 19** - UI framework for web
- **React Native + Expo** - Mobile app development
- **TailwindCSS** - Utility-first CSS styling
- **shadcn/ui** - Reusable UI components
- **Convex** - Real-time backend-as-a-service
- **better-auth** - Authentication
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Prerequisites

- Node.js 18+
- pnpm 10.23.0+

## Getting Started

Install dependencies:

```bash
pnpm install
```

## Commands

### Backend Setup (First Time)

```bash
# Configure Convex and run initial setup
pnpm dev:setup
```

Follow the prompts to create a new Convex project. Copy environment variables from `packages/backend/.env.local` to `apps/*/.env`.

### Development

```bash
# Run all apps and backend concurrently
pnpm dev

# Run only the web app
pnpm dev:web

# Run only the native/mobile app
pnpm dev:native

# Run only the backend (Convex dev server)
pnpm dev:server
```

### Build & Type Checking

```bash
# Build all applications
pnpm build

# Type-check all packages
pnpm check-types
```

### Code Quality

```bash
# Run Biome linter and formatter
pnpm check
```

### Native App Commands

```bash
cd apps/native

# Start Expo development server
pnpm dev

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android

# Generate native projects (for custom native code)
pnpm prebuild
```

## Project Structure

```
event-schedulr/
├── apps/
│   ├── web/                 # Web application (React + TanStack Start)
│   └── native/              # Mobile app (React Native + Expo)
├── packages/
│   ├── backend/             # Convex backend (database, API, auth)
│   ├── config/              # Shared TypeScript configuration
│   └── env/                 # Environment variable utilities
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## Environment Setup

1. Run `pnpm dev:setup` to configure Convex
2. Copy environment variables:
   - From `packages/backend/.env.local` to `apps/web/.env`
   - From `packages/backend/.env.local` to `apps/native/.env`

## Development URLs

- **Web App**: [http://localhost:3001](http://localhost:3001)
- **Mobile App**: Use Expo Go app to scan the QR code

## License

MIT

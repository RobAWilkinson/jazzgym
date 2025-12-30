# JazzGym - Chord Flashcards

A jazz guitar practice application that helps you memorize chords through timed flashcard exercises.

## Features

### ✅ Phase 1 & 2: Foundation Complete
- Next.js 14 with TypeScript
- Tailwind CSS + shadcn/ui components
- Client-side SQLite database (sql.js)
- Complete project structure

### ✅ Phase 3: User Story 1 (MVP) - Quick Practice Session
- **Timed chord flashcards**: Display chord names with countdown timer
- **Auto-advance**: Automatically moves to next chord when timer expires
- **Session tracking**: Records practice sessions in local database
- **Session summary**: Shows chords completed and duration after practice

### 🚧 Pending (Future Phases)
- **Phase 4**: Custom chord type filtering and time limit configuration
- **Phase 5**: Practice history with statistics and deletion
- **Phase 6**: Polish (loading states, keyboard shortcuts, mobile optimization)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Components**: shadcn/ui (Radix UI primitives)
- **Database**: SQLite via sql.js (client-side, persisted to IndexedDB)
- **Testing**: Vitest (unit), Playwright (E2E) - configured, tests not yet written

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm

### Installation

1. Clone the repository (if not already cloned)

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Run

On first launch, the application will:
1. Initialize the SQLite database in your browser
2. Create default preferences (10s time limit, all chord types enabled)
3. Be ready for practice!

## Project Structure

```
jazzgym/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with header
│   ├── page.tsx              # Home/practice page (MVP)
│   └── globals.css           # Global styles + Tailwind
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── input.tsx
│   ├── chord-display.tsx     # Large chord name display
│   ├── countdown-timer.tsx   # Visual countdown timer
│   └── session-summary.tsx   # End-of-session modal
├── lib/
│   ├── db.ts                 # SQLite database operations
│   ├── chord-generator.ts    # ~300 jazz chords + selection logic
│   ├── session-manager.ts    # Practice session state management
│   ├── types.ts              # TypeScript type definitions
│   └── utils.ts              # Utility functions
├── hooks/
│   ├── use-timer.ts          # Countdown timer hook
│   └── use-practice-session.ts # Practice session hook
├── db/
│   └── schema.sql            # SQLite database schema
└── public/
    └── db/
        └── schema.sql        # Schema (copied for web access)
```

## Database Schema

Three tables:
- **preferences**: User settings (singleton)
- **practice_sessions**: Practice session records
- **session_chords**: Individual chords practiced per session

All data stored locally in browser via IndexedDB.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest unit tests (when written)
npm run test:e2e     # Run Playwright E2E tests (when written)
```

## How It Works

1. **Start Practice**: Click "Start Practice" on home page
2. **Practice Session**:
   - A random jazz chord appears (e.g., "Cmaj7")
   - You have 10 seconds (default) to play it on your guitar
   - Timer auto-advances to the next chord
   - Click "Next Chord" to advance manually
   - Click "End Session" when done
3. **Session Summary**: View chords completed and total time
4. **Data Persists**: All sessions saved to local database

## Implementation Status

### ✅ Completed (MVP Ready)
- Phase 1: Setup (T001-T010) - Project initialization
- Phase 2: Foundational (T011-T017) - Core infrastructure
- Phase 3: User Story 1 (T018-T032) - MVP practice session

### 🎯 Next Steps
1. Test the MVP: `npm run dev` and practice chords
2. Phase 4: Add settings page for customization
3. Phase 5: Add practice history page
4. Phase 6: Polish with tests, keyboard shortcuts, mobile optimization

## Constitution Alignment

This project follows the JazzGym Constitution v1.0.0:

- ✅ **Simplicity First**: No over-engineering, straightforward Next.js structure
- ✅ **User-First Design**: All features serve guitar students practicing chords
- ✅ **Quality Over Speed**: Testing infrastructure ready, comprehensive planning

## Contributing

This is a personal practice application. See `.specify/` directory for complete specification, planning, and task documentation.

## License

ISC

## Acknowledgments

- Built with Next.js, React, Tailwind CSS, and shadcn/ui
- SQLite powered by sql.js
- Chord library includes comprehensive jazz voicings

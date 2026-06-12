# Synapse — AI Conference Intelligence Platform

> **The hidden connections between conference talks, found.**

Synapse solves a critical problem at multi-track conferences: attendees can only physically attend ~25% of sessions. They miss 75% of the content and 100% of the semantic connections between talks happening in parallel tracks. Synapse uses AI to discover those hidden connections, visualize them as an interactive knowledge graph, and generate personalized intelligence briefings based on actual attendance patterns.

**Built for GitNation KendoReact Hackathon 2026**

---

## The Problem

At any multi-track conference with parallel sessions, valuable knowledge connections are invisible to attendees:

- **Session isolation** — A talk on React Server Components in Track A and a talk on Edge Compute in Track B may share foundational insights, but attendees choosing one have no idea the other exists
- **Limited context** — Speakers focus on their own domain without explicitly connecting to related sessions
- **Post-conference gap** — After the event, attendees lack guidance on which missed sessions are worth watching based on what they actually attended
- **Knowledge fragmentation** — The real value isn't in isolated talks, it's in understanding how different ideas connect, contradict, or build on each other

Traditional conference apps show you a schedule. **Synapse shows you the graph of knowledge underneath it.**

---

## Our Solution

Synapse treats conference sessions as nodes in a semantic network and uses Google Gemini AI to discover meaningful connections ("synapses") between them. The platform provides three core capabilities:

### 1. AI-Powered Semantic Discovery

The system analyzes talk titles, abstracts, speaker backgrounds, and topic tags to discover five types of semantic relationships:

- **Complementary** — Two approaches that work together (e.g., React Server Components + Edge Runtime deployment)
- **Contradictory** — Opposing viewpoints or methodologies (e.g., Virtual DOM vs. Signals-based reactivity)
- **Foundational** — Theoretical concepts that underpin practical implementations
- **Cross-domain** — Techniques applied across different problem spaces
- **Evolutionary** — Before/after relationships showing technology progression

Each synapse includes an AI-generated insight explaining why the connection matters and what attendees should understand about the relationship.

### 2. Interactive Knowledge Graph

All talks and their connections are rendered as an interactive force-directed graph using D3.js. Attendees can:

- Hover over any session to see its connections illuminate while unrelated content fades
- Click sessions to view detailed abstracts, speaker info, and topic tags
- Click connection edges to read AI-generated semantic insights
- Zoom and drag to explore the full conference landscape
- Toggle fullscreen mode for presentation

The graph serves as a visual map of the entire conference's intellectual terrain, revealing patterns and clusters that wouldn't be obvious from a linear schedule.

### 3. Personalized Intelligence Briefings

Based on actual attendance selections, the system generates four-part intelligence reports:

**Conference DNA Profile** — A summary of the attendee's focus areas and learning trajectory across the event

**Deeper Intersections** — Hidden connections between sessions the attendee actually attended, with explanations of why those pairings reveal deeper patterns

**What You Missed** — Parallel-track sessions that connect strongly to attended talks, ranked by relevance

**Knowledge Gaps** — Topic areas absent from the attendee's selections with concrete recommendations for filling those gaps

**Priority Recordings** — A ranked watchlist of missed sessions worth reviewing post-conference (High/Medium/Low priority)

Briefings are saved to the database and can be retrieved instantly on return visits, enabling attendees to use them as a reference during and after the conference.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                                                          │
│  Landing → Knowledge Graph → Scheduler → Briefing       │
│            (D3.js + Kendo)   (Kendo)     (Kendo)       │
│                              Scheduler   AIPrompt       │
│                              + Grid      + Charts       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Next.js API Routes (App Router)            │
│                                                          │
│  /api/talks        Conference session data              │
│  /api/synapses     AI-discovered connections            │
│  /api/attendance   User session selections              │
│  /api/briefing     Generated intelligence reports       │
│  /api/chat         Conversational AI assistant          │
│  /api/analytics    Aggregated insights & rankings       │
│  /api/admin/import CSV bulk import pipeline             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│           Neon PostgreSQL (Serverless)                  │
│                                                          │
│  Speakers · Tracks · Talks · Synapses                   │
│  Users · Attendance · Briefings                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Google Gemini AI (via @google/genai)           │
│                                                          │
│  Synapse discovery · Briefing generation · Chat         │
└─────────────────────────────────────────────────────────┘
```

### Core Data Flow

1. **Conference data** (talks, speakers, tracks) is loaded into PostgreSQL via manual seeding or CSV import
2. **AI analysis** runs on-demand to discover semantic connections between all talk pairs
3. **Attendance tracking** captures which sessions each user plans to attend (saved to database)
4. **Briefing generation** analyzes attended sessions + discovered synapses to produce personalized reports
5. **Analytics aggregation** provides conference-wide metrics on topic coverage, connection density, and session rankings

---

## KendoReact Integration

This project uses **seven distinct KendoReact v15 components** to deliver a production-grade UI:

### 1. Scheduler — Conference Timetable

The **Scheduler** component displays all conference sessions as calendar events across a two-day programme. Sessions are automatically colour-coded by track, and users can switch between day views and timeline views. Clicking any session opens a detail dialog.

**Key features:**
- Dual-day navigation (June 12 & 13)
- Track-based colour coding via the resources API
- Time-slot visualization (09:00–17:00 conference hours)
- Integrated with session detail dialogs

### 2. Grid — Synapse Directory & Session List

The **Grid** component serves two purposes: the Synapse Directory (analytics page) shows all AI-discovered connections in a sortable table, and the Session Directory (schedule page) provides a filterable list of all talks. Custom cell renderers display colour-coded type badges, animated strength bars, and connection metadata.

**Key features:**
- Sortable columns (strength, type, session title)
- Custom cell rendering for rich visualizations
- Responsive design (switches to card layout on mobile)
- Search and filter integration

### 3. Dialog — Detail Panels

The **Dialog** component handles multiple use cases: session detail views (from the scheduler and graph), synapse connection details (from the knowledge graph), and confirmation flows. Each dialog is context-aware and displays relevant metadata based on what the user clicked.

**Key features:**
- Session details (speaker, time, track, abstract, tags)
- Synapse insights (connection type, strength, AI-generated explanation)
- Action buttons (add to schedule, close)
- Mobile-responsive sizing

### 4. Charts — Analytics Visualizations

The **Charts** package provides two visualizations on the analytics dashboard: a bar chart showing topic coverage distribution (most frequent tags) and a donut chart breaking down synapse types (complementary vs. contradictory vs. foundational).

**Key features:**
- Bar chart for tag frequency analysis
- Donut chart for synapse type distribution
- Themed to match the dark design system
- Hover tooltips with detailed data

### 5. ProgressBar — Loading Indicators

The **ProgressBar** component shows briefing generation progress during the 15–30 second AI analysis window. The bar animates smoothly from 0 to 95% as the request runs, then completes at 100% when the briefing is ready.

**Key features:**
- Smooth animation during long-running requests
- Visual feedback for AI processing time
- Gradient styling matching brand colours

### 6. AIPrompt (Conversational UI) — Chat Sidebar

The **AIPrompt** component from kendo-react-conversational-ui provides a chat interface in the briefing sidebar. Users can ask questions like *"Which talks cover my performance gaps?"* and receive contextual answers powered by Gemini AI with full synapse graph context.

**Key features:**
- Message threading and history
- Send button with keyboard shortcuts
- Conversational AI integration
- Fallback responses when AI is unavailable

### 7. Animation — Toast Notifications

The **Animation** package powers the attendance toast notifications that appear when users add or remove sessions from their schedule. Toasts slide in from the bottom-right with smooth enter/exit transitions.

**Key features:**
- Slide-in animations for toast messages
- Staggered display when multiple toasts queue
- Auto-dismiss after 2.5 seconds

---

## AI Engine — How Synapse Discovery Works

The AI pipeline has three stages with automatic fallbacks to ensure the knowledge graph is always populated:

### Primary: Gemini Model Cascade

The system first attempts to use Google Gemini AI with a two-model cascade:

1. **gemini-2.5-flash-lite** — Optimized for speed and cost, tries first
2. **gemini-2.5-flash** — Full model as backup if lite returns 503 (high demand)

Each model is called with a structured prompt containing all conference talks, their metadata, and instructions to identify 6–9 meaningful semantic connections. The AI returns JSON with connection pairs, type classification, strength scores (0.7–1.0), semantic insights, shared concepts, and attendee implications.

The system retries up to 4 times with exponential backoff (2s → 4s → 8s + random jitter) to handle temporary API overload.

### Secondary: Curated Fallback Synapses

If Gemini is completely unavailable (quota exhausted, service down), the system loads 9 pre-written high-quality synapses designed for the default conference dataset. These are hand-crafted connections that demonstrate the full range of synapse types.

### Tertiary: Tag-Overlap Generation

If custom conference data is imported via CSV (with different talk titles), the curated synapses won't match. The system then falls back to an algorithmic approach:

1. Score all talk pairs by shared tag count
2. Select top 9 pairs (or pad with cross-track pairs if tag overlap is sparse)
3. Generate connection metadata (type, strength, insight) based on the tag relationships

This three-level cascade guarantees that:
- Users always see a populated knowledge graph
- The quality degrades gracefully if AI is unavailable
- Custom CSV imports still produce semantic connections

---

## Connection Reliability & Error Handling

### Database Cold-Start Mitigation

Neon serverless databases have cold-start latency on first connection. The system uses:

- **Enhanced connection pool** with keepalive enabled to maintain TCP connections
- **15-second connection timeout** to handle cold starts
- **Retry logic with jitter** — all database operations retry up to 3 times with randomized delays (500–750ms → 1000–1500ms → 2000–3000ms) to avoid thundering herd

### Graceful Degradation

If the database is completely unreachable during briefing generation:

- An offline fallback briefing is returned instantly
- The UI shows a "Database temporarily unavailable" message
- The fallback content includes sample connections and recommendations
- Users are prompted to retry once the database reconnects

All API routes return `success: true` with `null` data rather than 500 errors, so the UI can render appropriate empty states with clear calls to action.

---

## CSV Import Pipeline

The admin tool (`/admin`) allows conference organizers to bulk-import an entire programme from CSV. The pipeline includes:

### Preview Mode

Before any database writes occur, the system:
- Parses the CSV client-side (handles quoted fields with commas)
- Validates required columns (title, speaker_name, track_name, times, etc.)
- Shows a card grid preview of all parsed sessions
- Displays row count and basic validation errors

### Import Mode

Once confirmed, the full import runs:

1. **Clear existing data** — removes all talks, speakers, tracks, synapses, attendance, briefings
2. **Seed tracks** — creates unique tracks from track_name + track_color columns
3. **Seed speakers** — creates unique speakers from speaker_name + speaker_company + speaker_bio
4. **Seed talks** — creates all sessions with proper foreign key relationships
5. **Trigger AI discovery** — attempts Gemini synapse generation, falls back to tag-overlap if needed

The entire process takes 60–90 seconds for a typical 15-talk conference (most time is spent in Gemini API calls with retry logic).

A downloadable CSV template is provided directly in the admin interface.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, API routes, routing |
| **UI Library** | React 19 | Component architecture |
| **Component Suite** | KendoReact 15 | Scheduler, Grid, Charts, Dialogs, AIPrompt |
| **Styling** | Tailwind CSS v4 | Utility-first styling with custom design tokens |
| **Animations** | Framer Motion | Page transitions, toast notifications, entrance animations |
| **Graph Visualization** | D3.js v7 | Force-directed graph with custom interactions |
| **AI** | Google Gemini (via @google/genai) | Semantic analysis, briefing generation, chat |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL with connection pooling |
| **ORM** | Prisma 7 (adapter-pg) | Type-safe database queries with retry logic |
| **Icons** | Lucide React | Consistent icon system |
| **Language** | TypeScript 5 | Type safety across the entire codebase |

---

## Data Model

### Core Entities

**Speaker** — Conference speaker with name, bio, company affiliation, and avatar  
**Track** — Conference track with name and colour code (for visual identification)  
**Talk** — Individual session with title, abstract, tags, speaker, track, time slot, and day  
**Synapse** — AI-discovered connection between two talks with type, strength, insight, and shared concepts  
**User** — Attendee account (demo mode uses a single shared user)  
**Attendance** — Junction table tracking which talks each user plans to attend  
**Briefing** — Generated intelligence report stored as JSON with conference DNA summary  

### Synapse Types

Each discovered connection is classified into one of five semantic relationship types:

| Type | Visual Indicator | Meaning |
|------|-----------------|---------|
| **Complementary** | 🟢 Green | Two approaches that work well together |
| **Contradictory** | 🔴 Red | Opposing viewpoints or conflicting methodologies |
| **Foundational** | 🔵 Blue | Theoretical foundation that underpins practical implementation |
| **Cross-domain** | 🟡 Amber | Technique or pattern applied across different domains |
| **Evolutionary** | 🩷 Pink | Before/after relationship showing technology evolution |

Each type uses a distinct colour in the knowledge graph for instant visual recognition.

---

## Design System

The interface uses a custom dark design system built on Tailwind CSS v4 with a deep space blue colour palette:

### Colour Palette

**Background Layers:**
- `#0a0a14` — Base background (deep space blue)
- `#10101c` → `#171722` → `#1e1e2a` → `#27273a` — Progressive surface elevation

**Brand Accents:**
- Violet `#8b5cf6` — Primary actions, knowledge graph nodes
- Cyan `#06b6d4` — Secondary actions, track colours
- Indigo `#6366f1` — Hover states, gradients

### Glassmorphism

Three glass surface variants provide depth:

- **Glass** — Subtle backdrop blur with 60% opacity for lightweight containers
- **Glass Strong** — 82% opacity with 24px blur for headers and tooltips
- **Glass Card** — Gradient-layered glass with elevation shadows for main content containers

All glass surfaces use `backdrop-filter` for real blur effects (not image-based approximations).

### Typography

Base font: **Inter** at 16px with relaxed line-height (1.65)

Hierarchy scale:
- Page titles: 3xl (30px), semibold
- Section headers: base (16px), semibold
- Body text: sm (14px), regular
- Meta text: xs (12px), medium

All text colours have been lifted from default Tailwind zinc values to ensure readability on the dark blue background (zinc-400 → `#d1d1d8`, zinc-500 → `#b0b0b8`).

---

## Setup Instructions

### Prerequisites

- Node.js 20 or higher
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (free tier: 15 RPM)
- A KendoReact license key

### Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=verify-full
GEMINI_API_KEY=your_google_ai_studio_key_here
TELERIK_LICENSE=your_kendoreact_license_key_here
```

**Important:** The `DATABASE_URL` must include `?sslmode=verify-full` for Neon connection pooling.

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Database Seeding

Visit `http://localhost:3000/api/seed` in your browser. You should see:

```json
{
  "success": true,
  "message": "Database and synapses seeded successfully!"
}
```

This populates the database with:
- 15 conference talks
- 10 speakers
- 2 tracks
- 9 AI-discovered synapses

### Production Build

```bash
npm run build
```

The build script automatically activates your KendoReact license before compiling. Expected output: `✓ Compiled successfully`.

---

## Usage Guide

### 1. Explore the Knowledge Graph

Navigate to `/explore` to see the interactive force-directed graph. All 15 conference talks appear as nodes, sized by their connection count. Coloured edges represent the AI-discovered synapses.

**Interactions:**
- Hover any node to highlight its connections
- Click a node to view session details
- Click an edge to read the AI-generated semantic insight
- Scroll to zoom in/out
- Drag nodes to rearrange the layout
- Click the fullscreen button (top-right) to expand

### 2. Build Your Schedule

Navigate to `/schedule` to see the Kendo Scheduler and session directory. The scheduler shows all talks in calendar format, colour-coded by track.

**Actions:**
- Switch between Day 1 (June 12) and Day 2 (June 13) using the toggle
- Click any session to view full details
- Use the "+ Add" button to mark sessions you plan to attend
- Search the session directory by title, speaker, or tags
- Filter by day or track
- Watch the attendance counter update in real-time (top-right)

All attendance is saved to the database instantly.

### 3. Generate Your Briefing

Navigate to `/briefing`. If you haven't marked any sessions as attending, you'll see a prompt to visit the scheduler first.

Once you've selected 3+ sessions:

1. Click **Generate Your Briefing**
2. Wait 15–30 seconds for AI analysis (progress bar shows status)
3. Review four sections:
   - **Conference DNA Profile** — your focus pattern
   - **Deeper Intersections** — connections between your attended talks
   - **What You Missed** — parallel-track sessions you should know about
   - **Knowledge Gaps** — topic areas absent from your selection
   - **Priority Recordings** — ranked watchlist for post-conference viewing

The briefing is saved to the database. Returning to `/briefing` loads it instantly.

**AI Chat:** Use the sidebar to ask questions like:
- "Which talks cover performance optimization?"
- "What connections did I miss?"
- "Recommend sessions for front-end architecture"

### 4. Review Analytics

Navigate to `/analytics` to see conference-wide metrics:

- **KPI Cards** — Total sessions, speaker count, average synapse strength
- **Topic Coverage Chart** — Bar chart showing most frequent tags
- **Synapse Distribution** — Donut chart of connection type breakdown
- **Synapse Directory** — Sortable grid of all discovered connections
- **Synapse Leaderboard** — Top 8 most-connected sessions with rankings

### 5. Import Custom Data (Admin)

Navigate to `/admin` to bulk-import a CSV:

1. Download the template CSV (includes sample data)
2. Edit in Excel/Google Sheets with your conference programme
3. Upload the CSV
4. Review the preview grid
5. Click **Import & Discover Connections**
6. Wait for AI analysis (60–90 seconds)

The system clears all existing data and rebuilds from your CSV.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seed` | GET | Clear database and seed 15 talks + 9 synapses |
| `/api/talks` | GET | Fetch all talks with speaker and track data |
| `/api/attendance` | GET | Get attended talk IDs for current user |
| `/api/attendance` | POST | Toggle attendance for a session |
| `/api/synapses` | GET | Fetch all AI-discovered connections |
| `/api/synapses` | POST | Trigger AI synapse generation |
| `/api/briefing` | GET | Fetch saved briefing for current user |
| `/api/briefing` | POST | Generate new AI briefing |
| `/api/chat` | POST | Send question to AI chat assistant |
| `/api/analytics` | GET | Fetch conference-wide analytics |
| `/api/admin/import` | POST | Import conference data from CSV |

---

## Troubleshooting

### Knowledge Graph Shows No Data

**Solution:** Visit `/api/seed` to populate the database, then refresh `/explore`.

### Briefing Says "No Scheduled Sessions"

**Solution:** Navigate to `/schedule` and mark at least 1 talk as attending, then return to `/briefing`.

### Gemini 503 Errors in Console

**Explanation:** This is normal under high API demand. The system automatically retries with exponential backoff and falls back to curated synapses if all attempts fail. The graph will still populate.

### Charts Not Displaying

**Solution:** Ensure synapses exist by visiting `/api/synapses`. If the count is 0, run `POST /api/synapses` to trigger AI discovery.

### Kendo License Warning in Console

**Solution:** Confirm `TELERIK_LICENSE` is set in your `.env` file, then run `npm run build` to activate the license.

### Database Connection Timeouts

**Explanation:** Neon serverless databases have cold-start latency. The system automatically retries with exponential backoff. Wait 2–3 seconds and retry the operation.

---

## Project Goals & Impact

**Problem Solved:** Conference attendees lose 75% of content value due to parallel tracks and hidden semantic connections between sessions.

**Solution Delivered:** AI-powered semantic discovery + interactive visualization + personalized intelligence briefings that adapt to actual attendance patterns.

**Real-World Application:** This system can be deployed at any multi-track conference (tech, academic, industry) to help attendees maximize learning and make informed decisions about session selection and post-event recording priorities.

**Technical Achievement:** Production-grade integration of KendoReact components, real-time AI processing with fallback strategies, and a fully persistent data pipeline from user actions through AI analysis to database storage.

---

## Credits

**Built for:** GitNation KendoReact Hackathon 2026  
**Tech Stack:** Next.js 16, KendoReact 15, Google Gemini AI, Neon PostgreSQL, D3.js  
**License:** MIT  


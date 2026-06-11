# Synapse — End-to-End Testing Guide

This document walks through the full user journey that demonstrates how Synapse solves the conference knowledge problem. Follow it in order — each step builds on the previous one.

---

## Prerequisites

Before testing, make sure your environment is ready.

**1. Install dependencies**
```bash
npm install
```

**2. Confirm your `.env` file has these three keys set:**
```
DATABASE_URL=...      # Neon pooled connection string
GEMINI_API_KEY=...    # Google AI Studio key
TELERIK_LICENSE=...   # KendoReact license
```

**3. Start the dev server**
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Step 1 — Seed the Database

The app needs talks, speakers, and synapses in the database before anything works.

**Visit:** `http://localhost:3000/api/seed`

You should get back:
```json
{ "success": true, "message": "Database and synapses seeded successfully!" }
```

This does three things in sequence:
- Clears any existing data
- Seeds 15 conference talks across 2 tracks and 10 speakers
- Seeds 9 hand-crafted synapses (AI-discovered connections)

**Verify in Neon (optional):** Run `npm run db:studio` to open Prisma Studio and confirm rows exist in Talk, Speaker, Synapse tables.

---

## Step 2 — Generate AI Synapses (optional upgrade)

The seed route loads pre-defined synapses. If you want Gemini to discover *its own* connections:

**Visit:** `http://localhost:3000/api/synapses` with a POST request, or use curl:
```bash
curl -X POST http://localhost:3000/api/synapses
```

Response will be either:
```json
{ "success": true, "source": "gemini", "count": 8 }
```
or if Gemini quota is hit:
```json
{ "success": true, "source": "fallback" }
```

Both are fine. The fallback synapses are high quality.

---

## Step 3 — Landing Page

**Visit:** `http://localhost:3000`

**What to check:**
- Hero headline loads with gradient text animation
- Animated mini knowledge graph SVG builds up (nodes pop in one by one, edges draw)
- Background orbs are drifting slowly
- "How It Works" 3-step section is visible when you scroll down
- Features grid shows all 4 cards (Explore, Schedule, Briefing, Analytics)
- Animated counters (15 Talks, 10 Speakers, etc.) count up when scrolled into view
- Header becomes more opaque after scrolling ~20px
- On mobile: hamburger opens a solid dark drawer from the right

---

## Step 4 — Knowledge Graph (Core Demo Feature)

**Visit:** `http://localhost:3000/explore`

This is the most important page for the demo. It visualises all talks as nodes and AI-discovered connections as edges.

**What to check:**

| Action | Expected behaviour |
|---|---|
| Page loads | Nodes animate in one by one (staggered, not all at once) |
| Hover a node | Connected nodes stay full opacity, others fade to 10%; connected edges brighten |
| Hover an edge | Edge brightens and a glow trail appears around it |
| Click a node | Kendo Dialog opens with talk title, speaker, abstract, tags, time |
| Click an edge | Kendo Dialog opens with synapse type (colour-coded badge), strength %, semantic insight, attendee implication, shared concepts |
| Scroll to zoom | Graph zooms in/out smoothly |
| Drag a node | Node moves, simulation adjusts in real-time |
| Fullscreen button (top-right) | Graph expands to fill the viewport |

**Edge colour key:**
- 🟢 Green = Complementary
- 🔴 Red = Contradictory
- 🔵 Blue = Foundational
- 🟡 Yellow = Cross-domain
- 🩷 Pink = Evolutionary

**The wow moment:** Click the edge between "React Server Components" and "Building at the Edge". The dialog shows the AI-generated insight explaining why these two parallel-track talks are deeply connected.

---

## Step 5 — Conference Scheduler

**Visit:** `http://localhost:3000/schedule`

This is where the user personalises their attendance, which drives the AI briefing.

**What to check:**

| Action | Expected behaviour |
|---|---|
| Page loads | Kendo Scheduler shows Day 1 talks colour-coded by track (violet = Track A, cyan = Track B) |
| Day 1 / Day 2 switcher | Toggle switches scheduler date; Day 2 shows June 13 talks |
| Session Directory below | Kendo Grid lists all 15 talks with speaker, track, time |
| Search bar | Typing "react" filters the grid in real-time |
| Click "+ Add" on any talk | Button turns green "Attending"; a toast notification appears bottom-right |
| Click "Attending" again | Removes attendance; toast shows removal |
| Counter top-right | "X / 15 sessions" rolls up/down with an animation as you toggle |
| Click a talk title in grid | Kendo Dialog opens with full session details + attend/remove button |

**Add at least 3–4 talks** across both tracks before moving to Step 6. This gives the briefing engine enough data.

**Database check:** Attendance is saved live. You can verify at `http://localhost:3000/api/attendance` — it returns the array of attended talk IDs.

---

## Step 6 — AI Briefing

**Visit:** `http://localhost:3000/briefing`

**What to check:**

| State | Expected behaviour |
|---|---|
| No attendance | Shows "No Scheduled Sessions" with a link to the scheduler |
| Has attendance, no briefing | Shows "Generate Your Briefing" button |
| Click generate | Loading overlay appears with animated synapse icon and Kendo ProgressBar |
| Briefing loads | Four sections appear with scroll-triggered fade-in animations |

**Four briefing sections to verify:**

1. **Conference DNA Profile** — A sentence describing your conference focus. Has animated gradient background (purple→cyan).
2. **Deeper Intersections** — Connections between talks you attended (sourced from DB synapses or Gemini).
3. **What You Missed** — Talks from the other track that connect to yours.
4. **Identified Gaps** — Topic areas not covered by your selections, with concrete action recommendations.
5. **Priority Recordings** — A Kendo-styled table ranking missed talks by priority (High/Medium/Low).

**AI Chat sidebar (right column):**
- Type a question like `"Which talks cover my performance gaps?"`
- Gemini responds in context of your attended sessions and all synapses
- If Gemini is unavailable, smart keyword fallbacks respond correctly

**Database check:** `http://localhost:3000/api/briefing` (GET) returns the saved briefing JSON.

---

## Step 7 — Analytics

**Visit:** `http://localhost:3000/analytics`

**What to check:**

| Element | Expected behaviour |
|---|---|
| 3 KPI cards | Animated counters count from 0 to value on load |
| Topic Coverage bar chart | Kendo Chart showing top tags by frequency |
| Synapse Distribution donut | Shows breakdown by type (Complementary, Contradictory, etc.) |
| Both charts | Slide up from y:24 as they enter viewport |
| Synapse Directory grid | Sortable Kendo Grid — click "Strength" column to sort |
| Strength bars in grid | Violet-to-cyan gradient bars showing connection strength |
| Synapse Leaderboard | Top 8 talks ranked by connection count, gold/silver/bronze for top 3 |
| Leaderboard talk links | Click a talk title → navigates to `/talks/[id]` detail page |

---

## Step 8 — Talk Detail Page

**Visit any talk detail** by clicking a title in the Synapse Leaderboard on Analytics, or navigate directly:
`http://localhost:3000/talks/[any-talk-id]`

**What to check:**
- Full talk info: title, speaker bio, track colour, day/time
- Abstract displayed
- Tags as chips
- "Connected Synapses" section listing all edges involving this talk
- Each synapse card shows: connection type (colour-coded), strength %, insight, attendee implication, shared concepts
- Clicking another talk title in the synapse list navigates to that talk's detail

---

## Step 9 — Mobile Responsiveness

Resize browser to 375px width or use DevTools mobile emulation.

**What to check:**
- Header hamburger button visible
- Tapping hamburger opens solid dark drawer (not transparent) from right
- Drawer shows all 4 nav links + "Get Started" button
- Tapping a link navigates and closes the drawer
- All pages stack vertically cleanly
- Kendo Grid has horizontal scroll on narrow screens
- Knowledge Graph is touch-scrollable and zoomable

---

## Full End-to-End Flow Summary

The story you're telling in 3 minutes:

```
1. Seed the DB          → /api/seed
2. Show the graph       → /explore  (click a synapse edge → wow moment)
3. Mark attendance      → /schedule (add 4 talks, toast fires, counter rolls)
4. Generate briefing    → /briefing (loading overlay → 4-section report saved to DB)
5. Show analytics       → /analytics (charts + leaderboard)
```

Every piece of data flows through the same Neon PostgreSQL database. The briefing is not generated on every load — it's fetched from the DB on revisit. This proves persistence.

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| Graph is empty | Visit `/api/seed` first, then refresh `/explore` |
| Briefing says "no attendance" | Go to `/schedule` and add at least 1 talk |
| Briefing generation fails | Check `GEMINI_API_KEY` in `.env`; the fallback briefing will still generate |
| Charts not showing | Ensure synapses exist — check `/api/synapses` returns data |
| Kendo license warning in console | Confirm `TELERIK_LICENSE` is set in `.env` and `npm run build` activates it |
| SSL warning in console | `sslmode=verify-full` should already be in your `DATABASE_URL` |

---

## Build Verification

Before submitting, run a production build to confirm there are no TypeScript or Next.js errors:

```bash
npm run build
```

Expected output: `✓ Compiled successfully` with no red errors. Warnings about bundle size or `use client` boundaries are acceptable.

# Synapse — Demo Script & Intro Content

---

## PART 1 — AI VIDEO INTRO CONTENT

> This is the narration script for your AI-generated intro video. Read it with a calm, confident tone. Pause at the line breaks.

---

### OPENING HOOK (0:00 – 0:12)

"You're at a conference.

Two tracks. Fifteen sessions. Brilliant speakers.

But you can only be in one room at a time."

---

### THE PROBLEM (0:12 – 0:35)

"Every year, conference attendees face the same invisible problem.

You choose Track A. Someone else chooses Track B.

But what if the talk you just attended — and the one happening across the hall right now —
are actually two halves of the same idea?

What if a speaker in Room B just contradicted everything you heard in Room A —
and that contradiction is the most valuable thing at the entire event?

You'd never know.

Because nobody told you the connections existed."

---

### THE INSIGHT (0:35 – 0:55)

"The real value of a conference isn't the sessions.

It's the space between them.

The overlap. The tension. The moments where one idea
builds on another, challenges another, or completes another.

That space has always been invisible.

Until now."

---

### THE SOLUTION (0:55 – 1:20)

"Synapse is an AI conference intelligence platform
built to solve exactly this problem.

It takes every talk at a conference —
titles, abstracts, speakers, topics —
and runs them through Google Gemini AI
to discover the hidden semantic connections between them.

Not just which sessions share a topic.
But which ones are complementary.
Which ones contradict each other.
Which ones are foundational to understanding another.

Then it maps all of that as a living, interactive knowledge graph —
so you can see the entire conference as a connected system,
not a list of isolated events."

---

### THE PAYOFF (1:20 – 1:45)

"And it doesn't stop there.

Synapse knows which sessions you attended.
It uses that to generate a personalized intelligence briefing —
telling you exactly what you missed, why it matters to you specifically,
and which recordings are worth your time after the event.

You attended 25% of the conference.
Synapse gives you the intelligence of someone who attended all of it."

---

### THE CLOSE (1:45 – 2:00)

"Built for GitNation 2026.
Powered by Google Gemini, Neon PostgreSQL, and KendoReact.

This is Synapse.

The hidden connections between conference talks — found."

---

---

## PART 2 — LIVE DEMO WALKTHROUGH

> Follow this sequence exactly for the demo. Each section should take roughly the time noted.

---

### STEP 1 — Seed the Database (~30 seconds)

**What to do:**
Open the browser and navigate to:
```
http://localhost:3000/api/seed
```

**What to say:**
"Before we begin, I'll seed the database with our conference programme —
15 talks, 10 speakers across 2 tracks, and 9 AI-discovered semantic connections.
One API call. Everything is live in Neon PostgreSQL."

**What to show:**
The browser returns:
```json
{ "success": true, "message": "Database and synapses seeded successfully!" }
```

---

### STEP 2 — Landing Page (~30 seconds)

**What to do:**
Navigate to `http://localhost:3000`

**What to say:**
"This is Synapse. The landing page gives a quick overview of what the platform does.
Notice the animated knowledge graph building in the hero — that's actually a live SVG
with staggered node and edge animations, giving a real feel for what's underneath."

**What to point out:**
- The animated mini-graph SVG in the hero
- The three-step 'How It Works' section
- The four feature cards — Knowledge Graph, Scheduler, Briefing, Analytics

---

### STEP 3 — Knowledge Graph — THE WOW MOMENT (~2 minutes)

**What to do:**
Navigate to `http://localhost:3000/explore`

**What to say:**
"This is the core of Synapse. Every talk is a node. Every AI-discovered connection is an edge.
The graph is fully interactive — built with D3.js force simulation on top of our real database data."

**Interactions to demo in order:**

1. **Hover a node**
   - Hover over any node
   - Say: "Watch what happens — connected sessions stay bright, everything else fades to 10% opacity.
     The graph is telling you which sessions are in the same semantic neighbourhood."

2. **Click a node**
   - Click any node to open the Kendo Dialog
   - Say: "Clicking a session opens a full detail panel — title, speaker, company, track, time, abstract, and tags.
     This is a KendoReact Dialog component, themed to match our dark design system."

3. **Click an edge — THE KEY MOMENT**
   - Click the edge between "React Server Components" and "Building at the Edge"
   - Say: "Now this is where it gets interesting. Click an edge and you see the AI-generated synapse.
     The type — in this case Cross-Domain — the strength score, the semantic insight Gemini wrote,
     and the attendee implication: why this specific connection matters to you as someone at the conference.
     This is not a tag match. This is genuine semantic reasoning from Gemini 2.5."

4. **Fullscreen**
   - Click the fullscreen button top-right
   - Say: "You can expand the graph to fill the viewport for a full conference map view."

**Edge colour key to mention:**
- Green = Complementary
- Red = Contradictory
- Blue = Foundational
- Amber = Cross-domain
- Pink = Evolutionary

---

### STEP 4 — Conference Scheduler (~1.5 minutes)

**What to do:**
Navigate to `http://localhost:3000/schedule`

**What to say:**
"Now let's build a personal schedule. This is the Kendo Scheduler component —
all 15 sessions laid out as calendar events, colour-coded by track.
Violet for Track A, cyan for Track B."

**Interactions to demo:**

1. **Day switcher**
   - Click "Day 2 — Jun 13"
   - Say: "The day switcher toggles the scheduler date. Day 2 shows the second half of the programme."
   - Switch back to Day 1

2. **Add sessions to schedule**
   - In the Session Directory below, click "+ Add" on 4 different sessions — mix tracks and days
   - Say: "I'll add a few sessions across both tracks. Watch the counter — it rolls up in real time.
     Every selection is saved live to Neon PostgreSQL. This isn't local state.
     If I refresh, my attendance is still here."

3. **Search**
   - Type "react" in the search bar
   - Say: "The session directory has live search across titles, speakers, and tags.
     Filtering instantly narrows down the list."

4. **Session detail dialog**
   - Click a session title in the directory
   - Say: "Clicking a title opens the Kendo Dialog with full session details
     and the ability to add or remove it from your schedule inline."

**Attendance counter to highlight:**
Point to the top-right counter showing "X / 15 sessions selected"

---

### STEP 5 — AI Briefing — THE INTELLIGENCE LAYER (~2 minutes)

**What to do:**
Navigate to `http://localhost:3000/briefing`

**What to say:**
"Now for the intelligence layer. Synapse takes everything I just selected —
my 4 attended sessions — and generates a personalized conference briefing using Gemini AI."

**Interactions to demo:**

1. **Click Generate**
   - Click "Generate Your Briefing"
   - Say: "The loading overlay appears with the Kendo ProgressBar animating in real time.
     Behind the scenes, Gemini is analysing my sessions against all discovered synapses
     to build a report specific to my attendance pattern."

2. **Walk through each section when it loads:**

   - **Conference DNA Profile**
     Say: "First — my Conference DNA. A single sentence describing my focus pattern across the event.
     In my case it identified compiler-driven and client-server architecture as my primary themes."

   - **Deeper Intersections**
     Say: "Next — hidden connections between talks I actually attended.
     These are the synapses the AI found within my own selection.
     It's telling me things the speakers themselves didn't explicitly connect."

   - **What You Missed**
     Say: "This section is the most valuable post-conference.
     Based on my attended sessions, Synapse identifies which parallel-track talks
     connect most strongly to what I saw — and why they matter to me specifically."

   - **Knowledge Gaps**
     Say: "Knowledge Gaps surfaces topic areas completely absent from my selection.
     Not just 'you missed this talk' — but 'here's the concept you have no coverage of,
     and here's what to watch to fill it.'"

   - **Priority Recordings**
     Say: "Finally, a ranked watchlist. High, Medium, Low priority — so after the event
     I'm not watching recordings randomly, I'm watching them in the order that builds on what I know."

3. **AI Chat sidebar**
   - Type: "Which talks cover my performance gaps?"
   - Say: "The briefing page also has an AI chat sidebar powered by the Kendo AIPrompt component.
     I can ask questions in context and get answers grounded in my specific attendance data."

4. **Persistence point**
   - Refresh the page
   - Say: "Watch this — I refresh the page and the briefing loads instantly from the database.
     It's not regenerated. It's persisted. This is a real production data flow."

---

### STEP 6 — Analytics (~1 minute)

**What to do:**
Navigate to `http://localhost:3000/analytics`

**What to say:**
"The analytics dashboard gives a conference-wide view of the data."

**What to point out:**

1. **KPI cards**
   - Say: "Three KPI cards with animated counters — sessions, speakers, average synapse strength.
     They count up from zero on load using IntersectionObserver."

2. **Charts**
   - Say: "Two Kendo Charts side by side.
     The bar chart shows topic coverage — which tags appear most across all sessions.
     The donut shows synapse type distribution — how many connections are complementary
     versus contradictory versus foundational."

3. **Synapse Directory**
   - Say: "The Kendo Grid below shows all discovered connections sortable by strength.
     On desktop it's a full data grid. On mobile it collapses to a card list automatically."

4. **Leaderboard**
   - Say: "The Synapse Leaderboard ranks sessions by connection count.
     Gold, silver, bronze for the top three. Click any title to navigate to the talk detail page."

---

### STEP 7 — Admin Import Tool (optional, if time allows)

**What to do:**
Navigate to `http://localhost:3000/admin`

**What to say:**
"Finally, the admin import tool. Any conference organiser can upload a CSV
with their programme and Synapse will import it, build the database, and trigger Gemini
to discover synapses automatically.

If Gemini is unavailable — we handle that too.
The system has a three-level fallback: Gemini Flash Lite → Gemini Flash → curated seeds →
and finally a tag-overlap algorithm that generates connections from the actual imported data.
The knowledge graph is always populated, regardless of AI availability."

---

### CLOSING STATEMENT (~20 seconds)

"Synapse turns a conference schedule into a knowledge system.

It solves the problem every multi-track conference attendee has —
you can't be in two places at once,
but now you can understand the whole conference as if you were.

Built on Next.js 16, KendoReact 15, Google Gemini, and Neon PostgreSQL.

Thank you."

---

---

## DEMO TIPS

- **Run `npm run dev` and have the browser open at `http://localhost:3000` before recording**
- **Seed the database fresh before every take** — visit `/api/seed` each time
- **Add exactly 4 sessions before generating the briefing** — gives the AI enough data for a rich report
- **Use a clean browser profile** — no extensions that inject visible UI elements
- **Record at 1920×1080** — the Knowledge Graph and Scheduler both look best at full HD
- **Disable browser notifications** before recording
- **The briefing generation takes 15–30 seconds** — don't cut away during the ProgressBar animation, it's a good visual

---

## KENDO COMPONENTS SHOWN IN DEMO

| Component | Where | What it demonstrates |
|-----------|-------|---------------------|
| Scheduler | `/schedule` | Two-day calendar, track colour-coding, resource grouping |
| Dialog | `/explore`, `/schedule` | Node details, synapse insights, session details |
| Grid | `/analytics` | Sortable synapse directory, custom cell renderers |
| Charts | `/analytics` | Bar chart (topic coverage) + Donut chart (synapse types) |
| ProgressBar | `/briefing` | AI generation loading state |
| AIPrompt | `/briefing` | Conversational AI sidebar with context |
| Animation | `/schedule` | Attendance toast slide-in notifications |

---

## ONE-LINE SUMMARY FOR JUDGES

> "Synapse uses AI to discover the hidden semantic connections between conference talks,
> visualizes them as an interactive knowledge graph, and generates personalized intelligence
> briefings so attendees understand the entire conference — not just the 25% they attended."

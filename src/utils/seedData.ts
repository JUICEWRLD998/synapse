// src/utils/seedData.ts
import { prisma } from "@/lib/prisma";

const speakersData = [
  {
    name: "Dan Abramov",
    company: "Bluesky",
    bio: "Former React core team member, currently working on Bluesky social network architectures.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Sophie Alpert",
    company: "Vercel",
    bio: "Former React core team manager, expert in frontend performance and compiler optimizations.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Guillermo Rauch",
    company: "Vercel",
    bio: "CEO of Vercel, creator of Next.js, passionate about serverless rendering and edge network deployment.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Lee Robinson",
    company: "Vercel",
    bio: "VP of Developer Experience at Vercel, helping developers build a faster web.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Sarah Drasner",
    company: "Google",
    bio: "Director of Engineering for Core Developer Web at Google, leading Chrome DevTools and Angular UX.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Alex Sexton",
    company: "Stripe",
    bio: "Infrastructure engineer specialized in internationalization, security, and global payments systems.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Theo Browne",
    company: "Ping.gg",
    bio: "CEO of Ping.gg, creator of t3-app, and tech commentator speaking on modern web stacks.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Una Kravets",
    company: "Google",
    bio: "Developer Advocate for Chrome Design, specializing in modern CSS Layouts, Web APIs, and design systems.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Lin Clark",
    company: "Fastly",
    bio: "WebAssembly pioneer, working on WebAssembly Micro-Runtime (WAMR) and Edge Compute runtimes.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Rich Harris",
    company: "Vercel",
    bio: "Creator of Svelte and Rollup, focused on compilation in UI design and removing runtime overhead.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

const tracksData = [
  { id: "track-a", name: "Track A: React & Core Architecture", color: "#8B5CF6" },
  { id: "track-b", name: "Track B: Devtools, AI & Performance", color: "#06B6D4" }
];

const getTalksData = (speakers: { id: string; name: string }[]) => {
  const getSpeakerId = (name: string) => {
    const speaker = speakers.find(s => s.name === name);
    if (!speaker) throw new Error(`Speaker not found: ${name}`);
    return speaker.id;
  };

  return [
    {
      title: "React Server Components: The Execution Model Deep Dive",
      abstract: "Let's trace React Server Components from the initial request to the React fiber tree mounting in the browser. We explore how RSC payloads are serialized, streamed over HTTP, and merged into the client-side state without losing DOM state. We will cover the boundary rules, server-side data fetching constraints, and debugging techniques using the react-compiler.",
      tags: ["react", "server-components", "rendering", "performance"],
      trackId: "track-a",
      speakerId: getSpeakerId("Dan Abramov"),
      startTime: new Date("2026-06-12T09:30:00Z"),
      endTime: new Date("2026-06-12T10:15:00Z"),
      day: 1
    },
    {
      title: "Building at the Edge: Serverless Compute Architectures",
      abstract: "Serverless execution at CDN edge nodes promised zero latency, but database roundtrips still limit real-world applications. We outline modern edge computing patterns, cold start mitigations, and transactional consistency when deploying Next.js applications close to users. We'll look at edge databases, globally distributed read-replicas, and request routing.",
      tags: ["edge-compute", "serverless", "infrastructure", "performance"],
      trackId: "track-b",
      speakerId: getSpeakerId("Guillermo Rauch"),
      startTime: new Date("2026-06-12T09:30:00Z"),
      endTime: new Date("2026-06-12T10:15:00Z"),
      day: 1
    },
    {
      title: "The Zero-Runtime CSS Revolution: Compiler-First Styles",
      abstract: "CSS-in-JS runtimes introduced significant styling flexibility but burdened the main thread with style evaluations. This talk demonstrates compiler-first CSS approaches (like CSS Modules and compile-time utility generators) that extract static styles into pure stylesheets while keeping component-level isolation. Learn to optimize CSS bundle sizes and render critical CSS inline during SSR.",
      tags: ["css", "performance", "compilers", "design-systems"],
      trackId: "track-a",
      speakerId: getSpeakerId("Sophie Alpert"),
      startTime: new Date("2026-06-12T10:30:00Z"),
      endTime: new Date("2026-06-12T11:15:00Z"),
      day: 1
    },
    {
      title: "Web Platform Features You Aren't Using (But Should)",
      abstract: "Modern browsers support advanced layout engines, container queries, and native popovers that render heavy JavaScript libraries obsolete. We explore CSS anchor positioning, native scroll-driven animations, and dialog elements. We show how leveraging the browser's native capabilities reduces JavaScript execution time, solves accessibility (A11y) bugs, and enhances rendering speed.",
      tags: ["css", "web-apis", "accessibility", "design-systems"],
      trackId: "track-b",
      speakerId: getSpeakerId("Una Kravets"),
      startTime: new Date("2026-06-12T10:30:00Z"),
      endTime: new Date("2026-06-12T11:15:00Z"),
      day: 1
    },
    {
      title: "AI-First Frontend: Agentic UI Generation and WebMCP",
      abstract: "The next wave of web applications will generate interfaces dynamically based on user needs. We present the Web Model Context Protocol (WebMCP), allowing LLM agents to interact directly with KendoReact UI components (grids, inputs) as tools. We'll cover prompt engineering for user interface structure, dynamic client-side hydration, and security safety rails in dynamic UI rendering.",
      tags: ["ai", "agents", "react", "dynamic-ui"],
      trackId: "track-b",
      speakerId: getSpeakerId("Lee Robinson"),
      startTime: new Date("2026-06-12T11:30:00Z"),
      endTime: new Date("2026-06-12T12:15:00Z"),
      day: 1
    },
    {
      title: "Deterministic State vs. Agentic Chaos in React Applications",
      abstract: "When UI is generated dynamically by AI agents, traditional state management patterns (Redux, Zustand) break down. We explore architectures that balance deterministic UI states (forms, settings) with agent-driven dynamic views. We analyze how to represent agent decisions in state trees, handle asynchronous agent streams, and ensure validation rules are preserved.",
      tags: ["react", "state-management", "ai", "architecture"],
      trackId: "track-a",
      speakerId: getSpeakerId("Theo Browne"),
      startTime: new Date("2026-06-12T11:30:00Z"),
      endTime: new Date("2026-06-12T12:15:00Z"),
      day: 1
    },
    {
      title: "JavaScript Runtimes: Benchmarking Node.js, Bun, and Deno",
      abstract: "Is Node.js actually losing the runtime wars? In this comprehensive benchmark, we test Node.js 22+, Bun, and Deno in serverless environments, HTTP routing, database connectivity, and file system operations. We discuss Web API compatibility, module resolution nuances, and startup speeds to help you choose the right runtime for your serverless API routes.",
      tags: ["runtimes", "performance", "backend", "nodejs"],
      trackId: "track-b",
      speakerId: getSpeakerId("Alex Sexton"),
      startTime: new Date("2026-06-12T13:30:00Z"),
      endTime: new Date("2026-06-12T14:15:00Z"),
      day: 1
    },
    {
      title: "WebAssembly: Elevating Heavy Calculations Beyond JS Limits",
      abstract: "JavaScript is fast, but image processing, compression, cryptographic algorithms, and canvas renders push V8 to its limits. Learn to write Rust and C++ modules, compile them to WebAssembly (Wasm), and load them dynamically in React applications. We cover memory buffers, serialization overhead, worker threads, and multi-threaded calculations.",
      tags: ["wasm", "performance", "rust", "computations"],
      trackId: "track-b",
      speakerId: getSpeakerId("Lin Clark"),
      startTime: new Date("2026-06-12T14:30:00Z"),
      endTime: new Date("2026-06-12T15:15:00Z"),
      day: 1
    },
    {
      title: "React Compiler: Say Goodbye to useMemo and useCallback",
      abstract: "The React Compiler automates memoization, eliminating manual memo, useMemo, and useCallback. Sophie shows how the compiler analyzes JS semantics, detects dependency changes, and optimizes re-renders automatically. We analyze real-world migration challenges, component structures that break the compiler, and how to verify correctness using DevTools.",
      tags: ["react", "react-compiler", "performance", "compilers"],
      trackId: "track-a",
      speakerId: getSpeakerId("Sophie Alpert"),
      startTime: new Date("2026-06-12T14:30:00Z"),
      endTime: new Date("2026-06-12T15:15:00Z"),
      day: 1
    },
    {
      title: "Reactive Compilation: Svelte's Approach to UI Architecture",
      abstract: "While React relies on virtual DOM diffing and automatic compilation to optimize updates, Svelte compiles reactivity directly into JavaScript syntax. Rich Harris contrasts Svelte's compiled reactivity model with React 19's runtime and compiler. We explore performance differences in memory footprint, bundle size, and DOM updates for data-heavy dashboards.",
      tags: ["svelte", "reactivity", "compilers", "performance"],
      trackId: "track-a",
      speakerId: getSpeakerId("Rich Harris"),
      startTime: new Date("2026-06-12T15:30:00Z"),
      endTime: new Date("2026-06-12T16:15:00Z"),
      day: 1
    },
    {
      title: "TypeScript Performance Patterns for Large Codebases",
      abstract: "TypeScript type-checking can slow CI pipelines and IDE responsiveness in large monorepos. This talk covers incremental compilation strategies, project references, const enums vs regular enums, and conditional types that accidentally create exponential complexity. We share benchmarks from migrating a 2M-line codebase to TypeScript 5.5 isolatedDeclarations.",
      tags: ["typescript", "performance", "tooling", "dx"],
      trackId: "track-b",
      speakerId: getSpeakerId("Sarah Drasner"),
      startTime: new Date("2026-06-12T15:30:00Z"),
      endTime: new Date("2026-06-12T16:15:00Z"),
      day: 1
    },
    {
      title: "The Future of Streaming: Suspense, PPR, and Partial Hydration",
      abstract: "Next.js Partial Prerendering (PPR) combines static shells with dynamic streaming slots. Dan dives deep into how Suspense boundaries interact with RSC streaming, how PPR differs from Islands Architecture, and how to architect pages for the fastest possible time-to-interactive. Live debugging with React DevTools Profiler included.",
      tags: ["react", "nextjs", "streaming", "ssr"],
      trackId: "track-a",
      speakerId: getSpeakerId("Dan Abramov"),
      startTime: new Date("2026-06-13T09:30:00Z"),
      endTime: new Date("2026-06-13T10:15:00Z"),
      day: 2
    },
    {
      title: "Modern Monorepo Architecture with Turborepo",
      abstract: "Turborepo caches build artifacts across machines, but the real value is the architectural discipline it enforces. We walk through setting up a Next.js monorepo with shared packages, isolated component libraries, and versioned API clients. Topics include remote caching, task pipelines, and handling breaking changes across internal packages without a publishing step.",
      tags: ["monorepo", "tooling", "architecture", "dx"],
      trackId: "track-b",
      speakerId: getSpeakerId("Lee Robinson"),
      startTime: new Date("2026-06-13T09:30:00Z"),
      endTime: new Date("2026-06-13T10:15:00Z"),
      day: 2
    },
    {
      title: "Signals vs. VDOM: A Framework War Analysis",
      abstract: "Fine-grained reactivity via Signals (Solid.js, Preact Signals, Angular) versus coarse-grained Virtual DOM reconciliation (React, Vue) represent two fundamentally different philosophies. We benchmark real-world scenarios — large data tables, real-time dashboards, animated lists — and discuss where each model shines, and what React's compiler is doing to close the gap.",
      tags: ["signals", "react", "performance", "frameworks"],
      trackId: "track-a",
      speakerId: getSpeakerId("Rich Harris"),
      startTime: new Date("2026-06-13T10:30:00Z"),
      endTime: new Date("2026-06-13T11:15:00Z"),
      day: 2
    },
    {
      title: "Micro-Frontends at Scale: Module Federation 2.0",
      abstract: "Module Federation 2.0 introduces dynamic remote containers, better TypeScript support, and manifest-driven discovery. We show how large enterprise teams at scale use MFE to allow 50+ squads to deploy independently while sharing a design system and authentication state. We cover the pitfalls: version conflicts, shared singleton state, and testing strategies.",
      tags: ["micro-frontends", "module-federation", "architecture", "scalability"],
      trackId: "track-b",
      speakerId: getSpeakerId("Guillermo Rauch"),
      startTime: new Date("2026-06-13T10:30:00Z"),
      endTime: new Date("2026-06-13T11:15:00Z"),
      day: 2
    }
  ];
};

export async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  // Clear in reverse dependency order
  await prisma.attendance.deleteMany({});
  await prisma.briefing.deleteMany({});
  await prisma.synapse.deleteMany({});
  await prisma.talk.deleteMany({});
  await prisma.speaker.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🗑️  Database cleared.");

  // Seed Tracks
  for (const track of tracksData) {
    await prisma.track.create({ data: track });
  }
  console.log("✅ Tracks seeded (2 tracks).");

  // Seed Speakers
  const createdSpeakers: { id: string; name: string }[] = [];
  for (const speaker of speakersData) {
    const s = await prisma.speaker.create({ data: speaker });
    createdSpeakers.push({ id: s.id, name: s.name });
  }
  console.log(`✅ Speakers seeded (${createdSpeakers.length} speakers).`);

  // Seed Talks
  const talks = getTalksData(createdSpeakers);
  for (const talk of talks) {
    await prisma.talk.create({ data: talk });
  }
  console.log(`✅ Talks seeded (${talks.length} talks).`);
  console.log("🎉 Database seed complete!");
}

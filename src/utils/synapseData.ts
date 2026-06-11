import { prisma } from "@/lib/prisma";

export interface PredefinedSynapse {
  titleA: string;
  titleB: string;
  type: "complementary" | "contradictory" | "foundational" | "cross-domain" | "evolutionary";
  strength: number;
  insight: string;
  concepts: string[];
  attendeeImplication: string;
}

const predefinedSynapses: PredefinedSynapse[] = [
  {
    titleA: "React Server Components: The Execution Model Deep Dive",
    titleB: "Building at the Edge: Serverless Compute Architectures",
    type: "cross-domain",
    strength: 0.88,
    insight: "React Server Components stream serialized HTML chunks directly from the server, which aligns perfectly with Edge Computing runtimes that minimize cold starts and latency. Combining the two allows rendering UI closer to users while leveraging server-side data fetching directly at the CDN edge.",
    concepts: ["React Server Components", "Edge Compute", "Cold Starts", "HTML Streaming"],
    attendeeImplication: "If you deploy RSCs on Vercel, this explains how edge runtimes serialize and stream your UI with minimum latency."
  },
  {
    titleA: "The Zero-Runtime CSS Revolution: Compiler-First Styles",
    titleB: "Web Platform Features You Aren't Using (But Should)",
    type: "complementary",
    strength: 0.78,
    insight: "Modern CSS layout features like container queries and anchor positioning are native to the browser, rendering complex runtime JS positioning libraries obsolete. Using a compiler-first CSS framework extracts these static native styles efficiently without clogging React's main thread.",
    concepts: ["Zero-Runtime CSS", "Anchor Positioning", "Web APIs", "Main Thread Performance"],
    attendeeImplication: "You can eliminate layout-thrashing JS libraries by combining compiler-extracted CSS with the browser's native popover and anchor APIs."
  },
  {
    titleA: "AI-First Frontend: Agentic UI Generation and WebMCP",
    titleB: "Deterministic State vs. Agentic Chaos in React Applications",
    type: "contradictory",
    strength: 0.92,
    insight: "While WebMCP advocates for dynamic, agent-generated interfaces hydrated on the fly, deterministic state architectures stress the importance of maintaining predictable, validated Redux/Zustand trees to prevent AI hallucinations from breaking core form flows.",
    concepts: ["Agentic UI", "State Management", "Deterministic UI", "WebMCP"],
    attendeeImplication: "Learn how to establish boundaries where the AI can generate components freely versus where traditional validation rules must remain rigid."
  },
  {
    titleA: "React Compiler: Say Goodbye to useMemo and useCallback",
    titleB: "Reactive Compilation: Svelte's Approach to UI Architecture",
    type: "evolutionary",
    strength: 0.85,
    insight: "The React Compiler parses JavaScript syntax to automate memoization at build time, bringing React closer to Svelte's compile-time reactivity philosophy. However, Svelte compiles reactivity directly into the DOM updates, bypassing the virtual DOM entirely.",
    concepts: ["React Compiler", "Svelte Reactivity", "Memoization", "Virtual DOM"],
    attendeeImplication: "Understand how compilation approaches differ: React automates memoization for the VDOM, while Svelte eliminates the VDOM altogether."
  },
  {
    titleA: "React Server Components: The Execution Model Deep Dive",
    titleB: "The Future of Streaming: Suspense, PPR, and Partial Hydration",
    type: "foundational",
    strength: 0.95,
    insight: "React Server Components serve as the foundational data-fetching and rendering architecture that makes Partial Prerendering (PPR) possible. PPR relies on RSC Suspense boundaries to split static shells from dynamic, streamed content slots.",
    concepts: ["React Server Components", "Partial Prerendering", "Suspense Boundaries", "Hydration"],
    attendeeImplication: "PPR is the culmination of RSC; structuring your Suspense boundaries correctly is key to achieving sub-100ms time-to-interactive."
  },
  {
    titleA: "Reactive Compilation: Svelte's Approach to UI Architecture",
    titleB: "Signals vs. VDOM: A Framework War Analysis",
    type: "foundational",
    strength: 0.9,
    insight: "Svelte 5's new reactivity engine is built entirely on fine-grained Signals. This talk directly connects to the Signals vs. VDOM debate, proving that compilers are moving away from full Virtual DOM diffs towards fine-grained dependency tracking.",
    concepts: ["Signals", "Svelte", "Virtual DOM", "Fine-grained Reactivity"],
    attendeeImplication: "Compare how Svelte's compiler-synthesized signals stack up against React's Virtual DOM reconciliation model."
  },
  {
    titleA: "JavaScript Runtimes: Benchmarking Node.js, Bun, and Deno",
    titleB: "WebAssembly: Elevating Heavy Calculations Beyond JS Limits",
    type: "cross-domain",
    strength: 0.75,
    insight: "Heavy cryptographic or image calculations can be offloaded to WebAssembly. The choice of JS runtime (Node, Bun, or Deno) affects Wasm startup time, buffer allocation speed, and how workers communicate multi-threaded results.",
    concepts: ["JS Runtimes", "WebAssembly", "Multithreading", "Performance Benchmarks"],
    attendeeImplication: "If running computationally heavy tasks on serverless functions, select a runtime that has the fastest Wasm instantiation overhead."
  },
  {
    titleA: "TypeScript Performance Patterns for Large Codebases",
    titleB: "Modern Monorepo Architecture with Turborepo",
    type: "complementary",
    strength: 0.8,
    insight: "TypeScript checking is a major bottleneck in large monorepos. Using Turborepo's remote build caching along with TS isolatedDeclarations allows caching type-checking outputs separately for each package, dramatically reducing local and CI build times.",
    concepts: ["TypeScript Compiler", "Turborepo", "Monorepos", "Build Caching"],
    attendeeImplication: "You can speed up type-checking in monorepos by isolatedDeclarations and caching packages with Turborepo."
  },
  {
    titleA: "Building at the Edge: Serverless Compute Architectures",
    titleB: "Micro-Frontends at Scale: Module Federation 2.0",
    type: "cross-domain",
    strength: 0.82,
    insight: "Serving independent micro-frontends can be coordinated directly at the CDN Edge. Using Module Federation 2.0, assets are resolved dynamically, and Edge routing can stitch together separate applications based on path, avoiding client-side overhead.",
    concepts: ["Edge Routing", "Micro-Frontends", "Module Federation 2.0", "Stitching"],
    attendeeImplication: "Deploying micro-frontends at the edge lets you bypass traditional client-side shell orchestration, boosting initial load speed."
  }
];

export async function seedSynapses() {
  console.log("🧬 Starting synapse seeding...");
  
  // Fetch all talks to map titles to ids
  const talks = await prisma.talk.findMany();
  
  let count = 0;
  for (const syn of predefinedSynapses) {
    const talkA = talks.find(t => t.title === syn.titleA);
    const talkB = talks.find(t => t.title === syn.titleB);
    
    if (talkA && talkB) {
      await prisma.synapse.upsert({
        where: {
          talkAId_talkBId: {
            talkAId: talkA.id,
            talkBId: talkB.id
          }
        },
        update: {
          type: syn.type,
          strength: syn.strength,
          insight: syn.insight,
          concepts: syn.concepts,
          attendeeImplication: syn.attendeeImplication
        },
        create: {
          talkAId: talkA.id,
          talkBId: talkB.id,
          type: syn.type,
          strength: syn.strength,
          insight: syn.insight,
          concepts: syn.concepts,
          attendeeImplication: syn.attendeeImplication
        }
      });
      count++;
    } else {
      console.warn(`⚠️ Could not find talks for synapse: "${syn.titleA}" <-> "${syn.titleB}"`);
    }
  }
  
  console.log(`✅ Synapses seeded successfully (${count} synapses).`);
}

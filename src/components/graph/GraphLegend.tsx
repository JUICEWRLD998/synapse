"use client";

interface GraphLegendProps {
  /** Whether to also show node-size legend */
  showNodeSizes?: boolean;
}

const edgeTypes: { type: string; color: string; description: string }[] = [
  { type: "Complementary", color: "#10B981", description: "Approaches that work together" },
  { type: "Contradictory", color: "#EF4444", description: "Opposing viewpoints or methods" },
  { type: "Foundational", color: "#3B82F6", description: "Theory underpins another's practice" },
  { type: "Cross-domain", color: "#F59E0B", description: "Technique applied across domains" },
  { type: "Evolutionary", color: "#EC4899", description: "Before & after relationship" },
];

export default function GraphLegend({ showNodeSizes = false }: GraphLegendProps) {
  return (
    <div className="glass-strong rounded-xl p-4 text-xs space-y-3 w-56">
      <div className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
        Edge Types
      </div>
      <ul className="space-y-2">
        {edgeTypes.map(({ type, color, description }) => (
          <li key={type} className="flex items-start gap-2">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-zinc-400 leading-snug">
              <span className="font-medium text-zinc-300">{type}</span>
              {" — "}
              {description}
            </span>
          </li>
        ))}
      </ul>

      {showNodeSizes && (
        <>
          <div className="border-t border-white/[0.06] pt-3 font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
            Node Size
          </div>
          <p className="text-zinc-500 leading-relaxed">
            Larger nodes have more synapse connections.
          </p>
        </>
      )}
    </div>
  );
}

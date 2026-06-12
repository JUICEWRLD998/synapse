"use client";

import { useState } from "react";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Synapse } from "@/types";

interface TopSynapsesGridProps {
  synapses: Synapse[];
}

const TYPE_COLORS: Record<string, { badge: string; dot: string }> = {
  Complementary: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  Contradictory: {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
  Foundational: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  "Cross-domain": {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  Evolutionary: {
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    dot: "bg-pink-400",
  },
};

export default function TopSynapsesGrid({ synapses }: TopSynapsesGridProps) {
  const gridData = synapses.map((s) => ({
    id: s.id,
    talkA: s.talkA?.title || "Unknown session",
    speakerA: s.talkA?.speaker?.name || "Unknown",
    talkB: s.talkB?.title || "Unknown session",
    speakerB: s.talkB?.speaker?.name || "Unknown",
    type: s.type.charAt(0).toUpperCase() + s.type.slice(1),
    strength: s.strength,
    insight: s.insight,
  }));

  const initialSort: SortDescriptor[] = [{ field: "strength", dir: "desc" }];
  const [sort, setSort] = useState<SortDescriptor[]>(initialSort);

  const sorted = orderBy(gridData, sort);

  /* ── Kendo cell renderers (desktop only) ── */
  const StrengthCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "strength"];
    const percent = (val * 100).toFixed(0);
    return (
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-14 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-semibold text-zinc-100 text-xs tabular-nums">
            {percent}%
          </span>
        </div>
      </td>
    );
  };

  const TypeCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "type"] as string;
    const c = TYPE_COLORS[val] ?? { badge: "bg-white/[0.03] text-zinc-400 border-white/[0.06]", dot: "" };
    return (
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${c.badge}`}>
          {val}
        </span>
      </td>
    );
  };

  const ConnectionCell = (props: GridCellProps) => {
    const item = props.dataItem;
    return (
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-zinc-100 font-semibold text-xs leading-snug">{item.talkA}</div>
          <div className="text-[11px] text-zinc-400">{item.speakerA}</div>
          <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider my-0.5">connects to</div>
          <div className="text-zinc-100 font-semibold text-xs leading-snug">{item.talkB}</div>
          <div className="text-[11px] text-zinc-400">{item.speakerB}</div>
        </div>
      </td>
    );
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
          Synapse Directory
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Explore and sort all computed talk relationships
        </p>
      </div>

      {/* ── MOBILE card list (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {sorted.map((item) => {
          const c = TYPE_COLORS[item.type] ?? { badge: "bg-white/[0.03] text-zinc-400 border-white/[0.06]", dot: "bg-zinc-400" };
          const percent = Math.round(item.strength * 100);
          return (
            <div
              key={item.id}
              className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-3 space-y-2.5"
            >
              {/* Type badge + strength */}
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${c.badge}`}>
                  {item.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-100 tabular-nums">{percent}%</span>
                </div>
              </div>

              {/* Connection */}
              <div className="space-y-1">
                <div>
                  <p className="text-xs font-semibold text-zinc-100 leading-snug">{item.talkA}</p>
                  <p className="text-[11px] text-zinc-400">{item.speakerA}</p>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">connects to</p>
                <div>
                  <p className="text-xs font-semibold text-zinc-100 leading-snug">{item.talkB}</p>
                  <p className="text-[11px] text-zinc-400">{item.speakerB}</p>
                </div>
              </div>

              {/* Insight */}
              {item.insight && (
                <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-2">
                  {item.insight}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP Kendo Grid (hidden on mobile) ── */}
      <div className="hidden md:block">
        <Grid
          data={sorted}
          sortable={true}
          sort={sort}
          onSortChange={(e) => setSort(e.sort)}
          className="k-grid-dark text-xs"
          rowHeight={90}
        >
          <GridColumn
            field="connection"
            title="Connected Sessions"
            cells={{ data: ConnectionCell }}
            width="320px"
            sortable={false}
          />
          <GridColumn
            field="type"
            title="Type"
            cells={{ data: TypeCell }}
            width="140px"
          />
          <GridColumn
            field="strength"
            title="Strength"
            cells={{ data: StrengthCell }}
            width="130px"
          />
          <GridColumn
            field="insight"
            title="Semantic Insight"
            className="text-zinc-300 text-xs leading-relaxed"
          />
        </Grid>
      </div>
    </div>
  );
}

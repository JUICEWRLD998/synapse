"use client";

import { useState } from "react";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Synapse } from "@/types";

interface TopSynapsesGridProps {
  synapses: Synapse[];
}

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

  const StrengthCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "strength"];
    const percent = (val * 100).toFixed(0);
    return (
      <td className="px-4 py-3 text-zinc-300">
        <div className="flex items-center gap-2">
          <div className="w-14 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-medium text-zinc-200 text-xs tabular-nums">
            {percent}%
          </span>
        </div>
      </td>
    );
  };

  const TypeCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "type"] as string;
    const colors: Record<string, string> = {
      Complementary: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
      Contradictory: "bg-rose-500/8 text-rose-400 border-rose-500/15",
      Foundational: "bg-blue-500/8 text-blue-400 border-blue-500/15",
      "Cross-domain": "bg-amber-500/8 text-amber-400 border-amber-500/15",
      Evolutionary: "bg-pink-500/8 text-pink-400 border-pink-500/15",
    };
    const colorClass =
      colors[val] || "bg-white/[0.03] text-zinc-400 border-white/[0.06]";

    return (
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${colorClass}`}
        >
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
          <div className="text-zinc-200 font-medium text-xs leading-snug">
            {item.talkA}
          </div>
          <div className="text-[10px] text-zinc-500">{item.speakerA}</div>
          <div className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider my-0.5">
            connects to
          </div>
          <div className="text-zinc-200 font-medium text-xs leading-snug">
            {item.talkB}
          </div>
          <div className="text-[10px] text-zinc-500">{item.speakerB}</div>
        </div>
      </td>
    );
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5">
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Synapse Directory
        </h4>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          Explore and sort all computed talk relationships
        </p>
      </div>

      <Grid
        data={orderBy(gridData, sort)}
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
          width="340px"
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
          width="140px"
        />
        <GridColumn
          field="insight"
          title="Semantic Insight"
          className="text-zinc-400 text-xs leading-relaxed"
        />
      </Grid>
    </div>
  );
}

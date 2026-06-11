"use client";

import { useState } from "react";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Synapse } from "@/types";

interface TopSynapsesGridProps {
  synapses: Synapse[];
}

export default function TopSynapsesGrid({ synapses }: TopSynapsesGridProps) {
  // Setup grid data mapping
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

  // Sorting state
  const initialSort: SortDescriptor[] = [{ field: "strength", dir: "desc" }];
  const [sort, setSort] = useState<SortDescriptor[]>(initialSort);

  // Custom Cells
  const StrengthCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "strength"];
    const percent = (val * 100).toFixed(0);
    return (
      <td className="px-4 py-3 text-zinc-300">
        <div className="flex items-center gap-2">
          <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-violet-500 h-1.5 rounded-full"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <span className="font-semibold text-zinc-100">{percent}%</span>
        </div>
      </td>
    );
  };

  const TypeCell = (props: GridCellProps) => {
    const val = props.dataItem[props.field || "type"] as string;
    const colors: Record<string, string> = {
      Complementary: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      Contradictory: "bg-rose-500/10 text-rose-400 border-rose-500/25",
      Foundational: "bg-blue-500/10 text-blue-400 border-blue-500/25",
      "Cross-domain": "bg-amber-500/10 text-amber-400 border-amber-500/25",
      Evolutionary: "bg-pink-500/10 text-pink-400 border-pink-500/25",
    };
    const colorClass = colors[val] || "bg-zinc-800 text-zinc-300 border-zinc-700/50";

    return (
      <td className="px-4 py-3 text-zinc-300">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
          {val}
        </span>
      </td>
    );
  };

  const ConnectionCell = (props: GridCellProps) => {
    const item = props.dataItem;
    return (
      <td className="px-4 py-3 font-sans">
        <div className="flex flex-col gap-0.5">
          <div className="text-zinc-100 font-semibold text-xs leading-snug">{item.talkA}</div>
          <div className="text-[10px] text-zinc-500">Speaker: {item.speakerA}</div>
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider my-0.5">Connects To</div>
          <div className="text-zinc-100 font-semibold text-xs leading-snug">{item.talkB}</div>
          <div className="text-[10px] text-zinc-500">Speaker: {item.speakerB}</div>
        </div>
      </td>
    );
  };

  return (
    <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden shadow-2xl p-4">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Synapse Directory</h4>
        <p className="text-xs text-zinc-500">Explore and sort all computed talk relationships</p>
      </div>

      <Grid
        data={orderBy(gridData, sort)}
        sortable={true}
        sort={sort}
        onSortChange={(e) => setSort(e.sort)}
        className="k-grid-dark font-sans border-zinc-800 bg-zinc-950 text-zinc-300 text-xs"
        rowHeight={95}
      >
        <GridColumn field="connection" title="Connected Sessions" cells={{ data: ConnectionCell }} width="350px" sortable={false} />
        <GridColumn field="type" title="Relationship Type" cells={{ data: TypeCell }} width="140px" />
        <GridColumn field="strength" title="Strength" cells={{ data: StrengthCell }} width="120px" />
        <GridColumn field="insight" title="Semantic Synthesis" className="text-zinc-400 font-sans text-xs leading-relaxed" />
      </Grid>
    </div>
  );
}

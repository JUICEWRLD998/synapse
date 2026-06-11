"use client";

import {
  Chart,
  ChartTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartTooltip,
} from "@progress/kendo-react-charts";
import { Talk, Synapse } from "@/types";

interface AnalyticsChartsProps {
  talks: Talk[];
  synapses: Synapse[];
}

export default function AnalyticsCharts({ talks, synapses }: AnalyticsChartsProps) {
  // 1. Calculate Tag Frequencies
  const tagCounts: Record<string, number> = {};
  talks.forEach((talk) => {
    talk.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7); // Top 7 tags

  const tagCategories = sortedTags.map((entry) => entry[0]);
  const tagValues = sortedTags.map((entry) => entry[1]);

  // 2. Calculate Synapse Types Distribution
  const typeCounts: Record<string, number> = {
    complementary: 0,
    contradictory: 0,
    foundational: 0,
    "cross-domain": 0,
    evolutionary: 0,
  };

  synapses.forEach((s) => {
    if (s.type in typeCounts) {
      typeCounts[s.type]++;
    }
  });

  const synapseTypeData = Object.entries(typeCounts).map(([type, count]) => ({
    category: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Topic density bar chart */}
      <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/50 backdrop-blur-sm shadow-xl flex flex-col justify-between">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Topic Coverage Density</h4>
        <div className="h-[280px]">
          <Chart style={{ height: "100%", background: "transparent" }}>
            <ChartTooltip />
            <ChartLegend visible={false} />
            <ChartCategoryAxis>
              <ChartCategoryAxisItem categories={tagCategories} labels={{ color: "#a1a1aa", font: "11px var(--font-geist-sans)" }} />
            </ChartCategoryAxis>
            <ChartSeries>
              <ChartSeriesItem
                type="bar"
                data={tagValues}
                color="#8b5cf6" // Violet 500
                gap={1.5}
                overlay={{ gradient: "glass" }}
              />
            </ChartSeries>
          </Chart>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2 text-center">
          Frequency of tags assigned to conference sessions (top 7)
        </p>
      </div>

      {/* Synapse distribution pie/donut chart */}
      <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/50 backdrop-blur-sm shadow-xl flex flex-col justify-between">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Synapse Distribution</h4>
        <div className="h-[280px]">
          <Chart style={{ height: "100%", background: "transparent" }}>
            <ChartTooltip />
            <ChartLegend labels={{ color: "#a1a1aa", font: "11px var(--font-geist-sans)" }} position="bottom" />
            <ChartSeries>
              <ChartSeriesItem
                type="donut"
                data={synapseTypeData}
                categoryField="category"
                field="value"
                overlay={{ gradient: "roundedBevel" }}
              />
            </ChartSeries>
          </Chart>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2 text-center">
          Breakdown of semantic relationship categories found by Synapse
        </p>
      </div>
    </div>
  );
}

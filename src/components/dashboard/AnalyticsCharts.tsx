"use client";

import { useRef, useState } from "react";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import { motion, useInView } from "framer-motion";
import { Talk, Synapse } from "@/types";

interface AnalyticsChartsProps {
  talks: Talk[];
  synapses: Synapse[];
}

export default function AnalyticsCharts({ talks, synapses }: AnalyticsChartsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Tag frequencies
  const tagCounts: Record<string, number> = {};
  talks.forEach((talk) => {
    talk.tags.forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const tagCategories = sortedTags.map(([tag]) => tag);
  const tagValues = sortedTags.map(([, count]) => count);

  // Synapse type distribution
  const typeCounts: Record<string, number> = {
    complementary: 0, contradictory: 0, foundational: 0, "cross-domain": 0, evolutionary: 0,
  };
  synapses.forEach((s) => { if (s.type in typeCounts) typeCounts[s.type]++; });
  const synapseTypeData = Object.entries(typeCounts).map(([type, count]) => ({
    category: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const donutColors = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#EC4899"];

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar chart */}
      <motion.div
        className="glass-card rounded-2xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Topic Coverage</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Frequency of top tags across sessions</p>
        </div>
        <div className="h-[260px]">
          <Chart style={{ height: "100%", background: "transparent" }}>
            <ChartTooltip />
            <ChartLegend visible={false} />
            <ChartCategoryAxis>
              <ChartCategoryAxisItem
                categories={tagCategories}
                labels={{ color: "#71717a", font: "11px Inter, system-ui, sans-serif" }}
                line={{ color: "rgba(63,63,70,0.3)" }}
              />
            </ChartCategoryAxis>
            <ChartValueAxis>
              <ChartValueAxisItem
                labels={{ color: "#52525b", font: "10px Inter, system-ui, sans-serif" }}
                line={{ color: "transparent" }}
                majorGridLines={{ color: "rgba(63,63,70,0.15)" }}
              />
            </ChartValueAxis>
            <ChartSeries>
              <ChartSeriesItem
                type="bar"
                data={tagValues}
                color="#8b5cf6"
                gap={1.2}
                overlay={{ gradient: "glass" }}
              />
            </ChartSeries>
          </Chart>
        </div>
      </motion.div>

      {/* Donut chart */}
      <motion.div
        className="glass-card rounded-2xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
      >
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Synapse Distribution</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Relationship type breakdown</p>
        </div>
        <div className="h-[260px]">
          <Chart style={{ height: "100%", background: "transparent" }}>
            <ChartTooltip />
            <ChartLegend
              labels={{ color: "#a1a1aa", font: "11px Inter, system-ui, sans-serif" }}
              position="bottom"
            />
            <ChartSeries>
              <ChartSeriesItem
                type="donut"
                data={synapseTypeData.map((d, i) => ({ ...d, color: donutColors[i % donutColors.length] }))}
                categoryField="category"
                field="value"
                colorField="color"
                overlay={{ gradient: "roundedBevel" }}
                holeSize={55}
              />
            </ChartSeries>
          </Chart>
        </div>
      </motion.div>
    </div>
  );
}

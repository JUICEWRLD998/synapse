"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Network, Sparkles, User, Calendar, Tag, ArrowRight } from "lucide-react";
import { Talk, Synapse } from "@/types";

interface KnowledgeGraphProps {
  talks: Talk[];
  synapses: Synapse[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  speakerName: string;
  speakerCompany: string;
  trackColor: string;
  trackName: string;
  tags: string[];
  abstract: string;
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  strength: number;
  insight: string;
  concepts: string[];
  attendeeImplication: string;
}

export default function KnowledgeGraph({ talks, synapses }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<Talk | null>(null);
  const [selectedLink, setSelectedLink] = useState<Synapse | null>(null);
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{
    x: number;
    y: number;
    title: string;
    speaker: string;
  } | null>(null);

  const typeColors: Record<string, string> = {
    complementary: "#10B981",
    contradictory: "#EF4444",
    foundational: "#3B82F6",
    "cross-domain": "#F59E0B",
    evolutionary: "#EC4899",
  };

  useEffect(() => {
    if (!svgRef.current || talks.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background-color", "transparent");

    // Defs for glow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const connectionCounts: Record<string, number> = {};
    synapses.forEach((s) => {
      connectionCounts[s.talkAId] = (connectionCounts[s.talkAId] || 0) + 1;
      connectionCounts[s.talkBId] = (connectionCounts[s.talkBId] || 0) + 1;
    });

    const nodes: GraphNode[] = talks.map((t) => {
      const connections = connectionCounts[t.id] || 0;
      return {
        id: t.id,
        title: t.title,
        speakerName: t.speaker?.name || "Unknown",
        speakerCompany: t.speaker?.company || "",
        trackColor: t.track?.color || "#71717a",
        trackName: t.track?.name || "General",
        tags: t.tags,
        abstract: t.abstract,
        radius: 12 + Math.min(connections * 3, 18),
      };
    });

    const links: GraphLink[] = synapses
      .map((s) => {
        const sourceNode = nodes.find((n) => n.id === s.talkAId);
        const targetNode = nodes.find((n) => n.id === s.talkBId);
        if (!sourceNode || !targetNode) return null;
        return {
          id: s.id,
          source: s.talkAId,
          target: s.talkBId,
          type: s.type,
          strength: s.strength,
          insight: s.insight,
          concepts: s.concepts,
          attendeeImplication: s.attendeeImplication,
        } as GraphLink;
      })
      .filter((l): l is GraphLink => l !== null);

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(130)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => d.radius + 16));

    // Render Links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => typeColors[d.type] || "#71717a")
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d) => 1 + d.strength * 3)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 0.9)
          .attr("stroke-width", 2.5 + d.strength * 4)
          .style("filter", "url(#glow)");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 0.35)
          .attr("stroke-width", 1 + d.strength * 3)
          .style("filter", "none");
      })
      .on("click", (event, d) => {
        const matched = synapses.find((s) => s.id === d.id);
        if (matched) setSelectedLink(matched);
      });

    // Render Nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("mouseover", (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setHoveredNodeInfo({
          x,
          y: y - 50,
          title: d.title,
          speaker: d.speakerName,
        });

        const connectedIds = new Set<string>([d.id]);
        links.forEach((l) => {
          const sId = typeof l.source === "string" ? l.source : l.source.id;
          const tId = typeof l.target === "string" ? l.target : l.target.id;
          if (sId === d.id) connectedIds.add(tId);
          if (tId === d.id) connectedIds.add(sId);
        });

        node.attr("opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.15));
        link.attr("stroke-opacity", (l) => {
          const sId = typeof l.source === "string" ? l.source : l.source.id;
          const tId = typeof l.target === "string" ? l.target : l.target.id;
          return sId === d.id || tId === d.id ? 0.85 : 0.03;
        });
      })
      .on("mouseout", () => {
        setHoveredNodeInfo(null);
        node.attr("opacity", 1);
        link.attr("stroke-opacity", 0.35);
      })
      .on("click", (event, d) => {
        const matched = talks.find((t) => t.id === d.id);
        if (matched) setSelectedNode(matched);
      });

    // Glow ring for large nodes
    node
      .filter((d) => d.radius > 16)
      .append("circle")
      .attr("r", (d) => d.radius + 5)
      .attr("fill", "none")
      .attr("stroke", (d) => d.trackColor)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.2)
      .style("filter", "url(#glow)");

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.trackColor)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 1.5)
      .style("filter", "url(#glow)");

    // Node Labels
    node
      .append("text")
      .attr("dx", (d) => d.radius + 8)
      .attr("dy", 4)
      .text((d) => d.speakerName)
      .attr("fill", "#d4d4d8")
      .attr("font-size", "11px")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 8px rgba(0,0,0,0.9)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [talks, synapses]);

  return (
    <div
      className="relative w-full glass-card rounded-2xl overflow-hidden"
      ref={containerRef}
    >
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 glass-strong p-4 rounded-xl max-w-xs text-xs space-y-3">
        <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5 text-violet-400" />
          <span>Conference Synapses</span>
        </div>
        <p className="text-zinc-500 leading-relaxed text-[11px]">
          Drag nodes to arrange. Scroll to zoom. Hover to reveal connections. Click for details.
        </p>
        <div className="border-t border-white/[0.06] pt-2.5 space-y-1.5">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Connection Types
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-zinc-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-[600px] block" />

      {/* Hover Tooltip */}
      {hoveredNodeInfo && (
        <div
          className="absolute z-20 pointer-events-none glass-strong text-white px-3 py-2 rounded-lg text-[11px] flex flex-col gap-0.5"
          style={{ left: hoveredNodeInfo.x + 10, top: hoveredNodeInfo.y }}
        >
          <span className="font-semibold text-zinc-100 max-w-[200px] truncate">
            {hoveredNodeInfo.title}
          </span>
          <span className="text-zinc-400">{hoveredNodeInfo.speaker}</span>
        </div>
      )}

      {/* Kendo Dialog — Session Details */}
      {selectedNode && (
        <Dialog
          title="Session Details"
          onClose={() => setSelectedNode(null)}
          width={480}
        >
          <div className="space-y-4 text-zinc-300 p-1">
            <h4 className="text-lg font-semibold text-white leading-snug">
              {selectedNode.title}
            </h4>

            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-white/[0.04]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-900/40 text-violet-300">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-zinc-100 text-sm">
                  {selectedNode.speaker?.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {selectedNode.speaker?.company || "Independent"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span>
                  Day {selectedNode.day} &middot;{" "}
                  {new Date(selectedNode.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: selectedNode.track?.color }}
                />
                <span className="truncate">{selectedNode.track?.name}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Abstract
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                {selectedNode.abstract}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedNode.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] font-medium bg-white/[0.04] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.06]"
                >
                  <Tag className="h-2.5 w-2.5 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.04]">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 rounded-lg border border-white/[0.06] transition"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Kendo Dialog — Synapse Connection */}
      {selectedLink && (
        <Dialog
          title="Synapse Connection"
          onClose={() => setSelectedLink(null)}
          width={480}
        >
          <div className="space-y-4 text-zinc-300 p-1">
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border"
                style={{
                  borderColor: typeColors[selectedLink.type],
                  color: typeColors[selectedLink.type],
                  backgroundColor: `${typeColors[selectedLink.type]}10`,
                }}
              >
                <Sparkles className="h-3 w-3" />
                {selectedLink.type}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Strength: {(selectedLink.strength * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                  Talk A
                </div>
                <div className="text-sm font-medium text-white">
                  {selectedLink.talkA?.title}
                </div>
                <div className="text-xs text-zinc-400">
                  {selectedLink.talkA?.speaker?.name}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-zinc-600 rotate-90" />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                  Talk B
                </div>
                <div className="text-sm font-medium text-white">
                  {selectedLink.talkB?.title}
                </div>
                <div className="text-xs text-zinc-400">
                  {selectedLink.talkB?.speaker?.name}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Semantic Insight
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed bg-white/[0.02] p-3 border border-white/[0.04] rounded-lg">
                {selectedLink.insight}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Attendee Implication
              </div>
              <p className="text-xs text-violet-300 italic bg-violet-950/15 border border-violet-900/20 p-3 rounded-lg">
                &ldquo;{selectedLink.attendeeImplication}&rdquo;
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Shared Concepts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLink.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="text-[10px] bg-white/[0.04] text-zinc-300 px-2.5 py-0.5 rounded border border-white/[0.06] font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.04]">
              <button
                onClick={() => setSelectedLink(null)}
                className="px-4 py-2 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 rounded-lg border border-white/[0.06] transition"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

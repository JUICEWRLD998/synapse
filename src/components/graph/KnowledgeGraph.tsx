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
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{ x: number; y: number; title: string; speaker: string } | null>(null);

  // Synapse connection type colors
  const typeColors: Record<string, string> = {
    complementary: "#10B981", // Emerald
    contradictory: "#EF4444", // Red
    foundational: "#3B82F6",  // Blue
    "cross-domain": "#F59E0B", // Amber
    evolutionary: "#EC4899",   // Pink
  };

  useEffect(() => {
    if (!svgRef.current || talks.length === 0) return;

    // Clear previous drawing
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = 550;

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background-color", "#09090b"); // Zinc 950

    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Compute connection counts for node sizing
    const connectionCounts: Record<string, number> = {};
    synapses.forEach(s => {
      connectionCounts[s.talkAId] = (connectionCounts[s.talkAId] || 0) + 1;
      connectionCounts[s.talkBId] = (connectionCounts[s.talkBId] || 0) + 1;
    });

    // Create Nodes
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
        radius: 12 + Math.min(connections * 3, 18), // Node size matches connectedness
      };
    });

    // Create Links
    const links: GraphLink[] = synapses
      .map((s) => {
        const sourceNode = nodes.find(n => n.id === s.talkAId);
        const targetNode = nodes.find(n => n.id === s.talkBId);
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
        } as any;
      })
      .filter((l) => l !== null) as GraphLink[];

    // Simulation Setup
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => d.radius + 15));

    // Render Links (Lines)
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => typeColors[d.type] || "#71717a")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => 1.5 + d.strength * 3)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.95).attr("stroke-width", 3 + d.strength * 4);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.5).attr("stroke-width", 1.5 + d.strength * 3);
      })
      .on("click", (event, d) => {
        const matchedSynapse = synapses.find(s => s.id === d.id);
        if (matchedSynapse) setSelectedLink(matchedSynapse);
      });

    // Render Nodes (Groups)
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("mouseover", (event, d) => {
        // Find screen coordinates for custom tooltip
        const [x, y] = d3.pointer(event, svgRef.current);
        setHoveredNodeInfo({
          x,
          y: y - 45,
          title: d.title,
          speaker: d.speakerName,
        });

        // Dim non-connected nodes and links
        const connectedNodeIds = new Set<string>([d.id]);
        links.forEach(l => {
          const sId = typeof l.source === "string" ? l.source : l.source.id;
          const tId = typeof l.target === "string" ? l.target : l.target.id;
          if (sId === d.id) connectedNodeIds.add(tId);
          if (tId === d.id) connectedNodeIds.add(sId);
        });

        node.attr("opacity", n => connectedNodeIds.has(n.id) ? 1.0 : 0.25);
        link.attr("stroke-opacity", l => {
          const sId = typeof l.source === "string" ? l.source : l.source.id;
          const tId = typeof l.target === "string" ? l.target : l.target.id;
          return sId === d.id || tId === d.id ? 0.9 : 0.05;
        });
      })
      .on("mouseout", () => {
        setHoveredNodeInfo(null);
        node.attr("opacity", 1.0);
        link.attr("stroke-opacity", 0.5);
      })
      .on("click", (event, d) => {
        const matchedTalk = talks.find(t => t.id === d.id);
        if (matchedTalk) setSelectedNode(matchedTalk);
      });

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.trackColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8)
      .style("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))");

    // Glow effect for large nodes
    node
      .filter((d) => d.radius > 16)
      .append("circle")
      .attr("r", (d) => d.radius + 6)
      .attr("fill", "none")
      .attr("stroke", (d) => d.trackColor)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.3)
      .attr("class", "pulse-ring")
      .style("animation", "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite");

    // Node Labels (Short titles)
    node
      .append("text")
      .attr("dx", (d) => d.radius + 8)
      .attr("dy", 4)
      .text((d) => d.speakerName)
      .attr("fill", "#e4e4e7") // Zinc 200
      .attr("font-size", "11px")
      .attr("font-family", "var(--font-geist-sans)")
      .attr("font-weight", 500)
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");

    // Simulation Ticks
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);
    });

    // Drag handlers
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [talks, synapses]);

  return (
    <div className="relative w-full border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden shadow-2xl" ref={containerRef}>
      {/* Legend & Instructions overlay */}
      <div className="absolute top-4 left-4 z-10 bg-zinc-900/95 border border-zinc-800 p-4 rounded-xl backdrop-blur-md max-w-xs text-xs space-y-3 shadow-lg">
        <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
          <Network className="h-4 w-4 text-violet-400" />
          <span>Conference Synapses</span>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          Each node is a session (size shows total connections). Drag nodes to arrange. Scroll/pinch to zoom. Hover to reveal links.
        </p>
        <div className="border-t border-zinc-800 pt-2.5 space-y-1.5">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Synapse Types</div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors.complementary }}></span>
              Complementary
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors.contradictory }}></span>
              Contradictory
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors.foundational }}></span>
              Foundational
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors.evolutionary }}></span>
              Evolutionary
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300 col-span-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors["cross-domain"] }}></span>
              Cross-domain
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-[550px] block" />

      {/* Interactive Node Hover Tooltip */}
      {hoveredNodeInfo && (
        <div
          className="absolute z-20 pointer-events-none bg-zinc-900 border border-zinc-800 text-white px-3 py-2 rounded-lg text-[11px] shadow-lg flex flex-col gap-0.5"
          style={{ left: hoveredNodeInfo.x + 10, top: hoveredNodeInfo.y }}
        >
          <span className="font-bold text-zinc-100 max-w-[200px] truncate">{hoveredNodeInfo.title}</span>
          <span className="text-zinc-400">Speaker: {hoveredNodeInfo.speaker}</span>
        </div>
      )}

      {/* Kendo Dialog for Selected Talk (Node) */}
      {selectedNode && (
        <Dialog title="Session Details" onClose={() => setSelectedNode(null)} width={500}>
          <div className="space-y-4 text-zinc-300 font-sans p-2">
            <h4 className="text-lg font-bold text-white leading-snug">{selectedNode.title}</h4>
            
            {/* Speaker Info */}
            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/40 text-violet-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-100">{selectedNode.speaker?.name}</div>
                <div className="text-xs text-zinc-400">{selectedNode.speaker?.company || "Independent"}</div>
              </div>
            </div>

            {/* Session Time & Track */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Day {selectedNode.day} • {new Date(selectedNode.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedNode.track?.color }}></span>
                <span className="truncate">{selectedNode.track?.name}</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Abstract</div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                {selectedNode.abstract}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedNode.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/50">
                  <Tag className="h-2.5 w-2.5 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-zinc-800">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-4 py-2 text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700/50 transition"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}

      {/* Kendo Dialog for Selected Synapse (Link) */}
      {selectedLink && (
        <Dialog title="Synapse Connection" onClose={() => setSelectedLink(null)} width={500}>
          <div className="space-y-4 text-zinc-300 font-sans p-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                    style={{
                      borderColor: typeColors[selectedLink.type],
                      color: typeColors[selectedLink.type],
                      backgroundColor: `${typeColors[selectedLink.type]}10`
                    }}>
                <Sparkles className="h-3 w-3" />
                {selectedLink.type} Synapse
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Connection Strength: {(selectedLink.strength * 100).toFixed(0)}%
              </span>
            </div>

            {/* Connector Interface */}
            <div className="space-y-2.5">
              <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Talk A</div>
                <div className="text-sm font-semibold text-white leading-tight">{selectedLink.talkA?.title}</div>
                <div className="text-xs text-zinc-400">Speaker: {selectedLink.talkA?.speaker?.name}</div>
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-zinc-600 rotate-90 sm:rotate-0" />
              </div>

              <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Talk B</div>
                <div className="text-sm font-semibold text-white leading-tight">{selectedLink.talkB?.title}</div>
                <div className="text-xs text-zinc-400">Speaker: {selectedLink.talkB?.speaker?.name}</div>
              </div>
            </div>

            {/* AI Deep Insight */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Semantic Insight</div>
              <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-900/30 p-3 border border-zinc-900 rounded-lg">
                {selectedLink.insight}
              </p>
            </div>

            {/* Attendee Implication */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Attendee Implication</div>
              <p className="text-xs text-violet-300 italic bg-violet-950/20 border border-violet-900/30 p-3 rounded-lg">
                &ldquo;{selectedLink.attendeeImplication}&rdquo;
              </p>
            </div>

            {/* Concepts */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Shared Concepts</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLink.concepts.map(concept => (
                  <span key={concept} className="text-[10px] bg-zinc-800/80 text-zinc-300 px-2.5 py-0.5 rounded border border-zinc-700/40 font-medium">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-zinc-800">
            <button
              onClick={() => setSelectedLink(null)}
              className="px-4 py-2 text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700/50 transition"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

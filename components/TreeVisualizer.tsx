import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { MerchandiseNode, TreeResponse } from "../types";
import { Download, ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";

interface TreeVisualizerProps {
  data: TreeResponse;
}

const TAG_COLORS = {
  引流: "#10b981", // Emerald 500
  流行: "#8b5cf6", // Violet 500
  小眾: "#f59e0b", // Amber 500
};

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Zoom handling helper
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current)
        .transition()
        .call(zoomBehavior.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current)
        .transition()
        .call(zoomBehavior.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
     if (svgRef.current && wrapperRef.current && zoomBehavior.current) {
       const height = Math.max(wrapperRef.current.clientHeight, 700);
       d3.select(svgRef.current)
         .transition()
         .call(zoomBehavior.current.transform, d3.zoomIdentity.translate(80, height / 3).scale(1));
     }
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merch-tree-${data.name}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = Math.max(wrapperRef.current.clientHeight, 700);

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent")
      .style("cursor", "grab");

    const g = svg.append("g");

    // Configure Zoom
    zoomBehavior.current = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior.current);

    // Data processing
    const root = d3.hierarchy<MerchandiseNode>(data);

    // Define tree layout (Horizontal)
    // Dynamic sizing based on tree structure
    const leaves = root.leaves().length;
    const depth = root.height;

    // More generous spacing
    const nodeHeight = 50; // vertical spacing between nodes
    const levelWidth = 220; // horizontal spacing between levels

    const treeHeight = Math.max(height - 100, leaves * nodeHeight);
    const treeWidth = Math.max(width - 200, depth * levelWidth);

    const treeLayout = d3.tree<MerchandiseNode>().size([treeHeight, treeWidth]);
    treeLayout(root);

    // Calculate initial scale to fit content
    const contentWidth = treeWidth + 200;
    const contentHeight = treeHeight + 100;
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const initialScale = Math.min(scaleX, scaleY, 1) * 0.9;

    // Initial Transform - center the tree
    svg.call(
        zoomBehavior.current.transform,
        d3.zoomIdentity.translate(80, (height - treeHeight * initialScale) / 2).scale(initialScale)
    );

    // Links with more visible color
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 2.5)
      .attr("stroke-opacity", 0.6)
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      );

    // Nodes
    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", (d) => `node ${d.children ? "internal" : "leaf"}`)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Node Circles with glass shadow effect
    node
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? 10 : 6))
      .attr("fill", (d) => {
          if (d.data.tag) return TAG_COLORS[d.data.tag as keyof typeof TAG_COLORS] || "#8C9194";
          return d.children ? "#6366f1" : "#8C9194";
      })
      .attr("stroke", "rgba(255, 255, 255, 0.6)")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))");

    // Labels with glass-matching styling
    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -14 : 14))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("fill", "#3a3f42")
      .attr("font-weight", (d) => d.depth === 0 ? "bold" : "medium")
      .attr("font-size", (d) => d.depth === 0 ? "14px" : "12px")
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 4);

    // Tags (Pills) for leaves
    const leavesSelection = node.filter((d) => !d.children && !!d.data.tag);

    leavesSelection.each(function(d) {
        const group = d3.select(this);
        const textWidth = group.select("text").node()!.getBBox().width;

        // Tag background with glass style
        group.append("rect")
            .attr("x", textWidth + 22)
            .attr("y", -11)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", 44)
            .attr("height", 22)
            .attr("fill", TAG_COLORS[d.data.tag as keyof typeof TAG_COLORS] || "#8C9194")
            .attr("opacity", 0.2);

        // Tag Text
        group.append("text")
            .attr("x", textWidth + 44)
            .attr("y", 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", TAG_COLORS[d.data.tag as keyof typeof TAG_COLORS] || "#8C9194")
            .attr("font-weight", "bold")
            .text(d.data.tag || "");
    });


  }, [data]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
        {/* Glass Control Panel */}
        <div className="absolute top-4 right-4 z-10 glass-sm flex gap-1 p-2">
             <button onClick={handleZoomIn} className="glass-icon-btn p-2 text-[#5a6166] hover:text-[#3a3f42]" title="Zoom In">
                <ZoomIn size={18} />
            </button>
             <button onClick={handleZoomOut} className="glass-icon-btn p-2 text-[#5a6166] hover:text-[#3a3f42]" title="Zoom Out">
                <ZoomOut size={18} />
            </button>
            <button onClick={handleResetZoom} className="glass-icon-btn p-2 text-[#5a6166] hover:text-[#3a3f42]" title="Reset View">
                <RefreshCcw size={18} />
            </button>
            <div className="w-px h-6 bg-white/30 mx-1 self-center"></div>
             <button onClick={downloadSVG} className="glass-icon-btn p-2 text-[#5a6166] hover:text-[#3a3f42]" title="Download SVG">
                <Download size={18} />
            </button>
        </div>

        {/* Glass Legend */}
        <div className="absolute bottom-4 left-4 z-10 glass-sm p-4 text-xs space-y-2">
            <div className="font-semibold text-[#3a3f42] mb-2">戰略三角 (Strategic Mix)</div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10b981]" style={{boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'}}></span>
                <span className="text-[#5a6166]">引流款 (Traffic)</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8b5cf6]" style={{boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'}}></span>
                <span className="text-[#5a6166]">流行款 (Trendy)</span>
            </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" style={{boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'}}></span>
                <span className="text-[#5a6166]">小眾款 (Niche)</span>
            </div>
        </div>

      <div ref={wrapperRef} className="flex-1 w-full h-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-full block"></svg>
      </div>
    </div>
  );
};

export default TreeVisualizer;

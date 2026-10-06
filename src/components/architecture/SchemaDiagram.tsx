import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Layers } from 'lucide-react';

export const SchemaDiagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('ALL');

  const SCENARIOS = [
    { id: 'ALL', label: 'Semua Overview', nodes: [] },
    { id: 'SCENARIO_1', label: '1. Maba New', nodes: ['sidara', 'users', 'staging', 'pembayaran'] },
    { id: 'SCENARIO_2', label: '2. Eksisting (Non-Tenant)', nodes: ['sidara', 'users', 'staging', 'pembayaran'] },
    { id: 'SCENARIO_3', label: '3. Penghuni Aktif', nodes: ['users', 'penyewa', 'kamar', 'pembayaran'] },
    { id: 'SCENARIO_4', label: '4. Cicilan Deposit', nodes: ['staging', 'pembayaran', 'cicilan', 'penyewa'] },
    { id: 'SCENARIO_5', label: '5. Draft Renewal', nodes: ['penyewa', 'renewal', 'pembayaran', 'kamar'] }
  ];

  const handleToggleExpandAll = () => {
    if (expandAll) {
      setExpandedNodes(new Set());
    } else {
      const allIds = [
        "sidara", "users", "staging", "penyewa", 
        "pembayaran", "cicilan", "renewal", "kamar"
      ];
      setExpandedNodes(new Set(allIds));
    }
    setExpandAll(!expandAll);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const activeNodes = SCENARIOS.find(s => s.id === activeScenario)?.nodes || [];
    const isScenarioMode = activeScenario !== 'ALL';

    // Define Arrowheads
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#64748b");

    svg.append("defs").append("marker")
      .attr("id", "arrow-dashed")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#10b981");

    svg.append("defs").append("marker")
      .attr("id", "arrow-sync")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3b82f6");

    // Columns Map Definition
    const colsMap: Record<string, {name: string, keyType: string, dataType: string}[]> = {
      sidara: [
        {name: 'NIM', keyType: 'PK', dataType: 'String'},
        {name: 'StatusAkademik', keyType: '', dataType: 'Enum'},
        {name: 'DataBiodata', keyType: '', dataType: 'JSON'}
      ],
      users: [
        {name: 'id_user', keyType: 'PK', dataType: 'UUID'},
        {name: 'identifier', keyType: 'UK', dataType: 'String'},
        {name: 'role', keyType: '', dataType: 'Enum'},
        {name: 'last_login', keyType: '', dataType: 'DateTime'}
      ],
      staging: [
        {name: 'id_staging', keyType: 'PK', dataType: 'UUID'},
        {name: 'id_user', keyType: 'FK', dataType: 'UUID'},
        {name: 'tipe_pendaftar', keyType: '', dataType: 'Enum'},
        {name: 'status_onboarding', keyType: '', dataType: 'String'}
      ],
      penyewa: [
        {name: 'id_penyewa', keyType: 'PK', dataType: 'UUID'},
        {name: 'NIM', keyType: 'FK', dataType: 'String'},
        {name: 'id_kamar', keyType: 'FK', dataType: 'String'},
        {name: 'tanggal_mulai', keyType: '', dataType: 'Date'},
        {name: 'status', keyType: '', dataType: 'Enum'}
      ],
      pembayaran: [
        {name: 'id_invoice', keyType: 'PK', dataType: 'UUID'},
        {name: 'id_penyewa', keyType: 'FK', dataType: 'UUID'},
        {name: 'tipe_tagihan', keyType: '', dataType: 'Enum'},
        {name: 'status', keyType: '', dataType: 'Enum'},
        {name: 'is_cicilan', keyType: '', dataType: 'Boolean'}
      ],
      cicilan: [
        {name: 'id_cicilan', keyType: 'PK', dataType: 'UUID'},
        {name: 'id_invoice', keyType: 'FK', dataType: 'UUID'},
        {name: 'termin_ke', keyType: '', dataType: 'Int'},
        {name: 'nominal_termin', keyType: '', dataType: 'Decimal'},
        {name: 'status_termin', keyType: '', dataType: 'Enum'}
      ],
      renewal: [
        {name: 'id_draft', keyType: 'PK', dataType: 'UUID'},
        {name: 'id_penyewa', keyType: 'FK', dataType: 'UUID'},
        {name: 'periode_baru', keyType: '', dataType: 'Date'},
        {name: 'status_draft', keyType: '', dataType: 'Enum'},
        {name: 'id_invoice_renewal', keyType: 'FK', dataType: 'UUID'}
      ],
      kamar: [
        {name: 'id_kamar', keyType: 'PK', dataType: 'String'},
        {name: 'gedung', keyType: '', dataType: 'String'},
        {name: 'kapasitas', keyType: '', dataType: 'Int'},
        {name: 'terisi', keyType: '', dataType: 'Int'}
      ],
    };

    const boxWidth = 200;
    const baseBoxHeight = 70;

    // Base Nodes Data
    const rawNodes = [
      { id: "sidara", label: "SIDARA_DB", desc: "Source of Truth Akademik", type: "external", color: "#475569" },
      { id: "users", label: "ASRAMA_USERS", desc: "Auth & Identity", type: "core", color: "#8b5cf6" },
      { id: "staging", label: "STAGING_PENDAFTARAN", desc: "Skenario 1 & 2 (Booking)", type: "staging", color: "#f59e0b" },
      { id: "penyewa", label: "MASTER_PENYEWA", desc: "Skenario 3 (Penghuni Aktif)", type: "master", color: "#10b981" },
      { id: "kamar", label: "MASTER_KAMAR", desc: "Infrastruktur Asrama", type: "infra", color: "#6366f1" },
      { id: "pembayaran", label: "MASTER_PEMBAYARAN", desc: "Tagihan Induk", type: "master", color: "#10b981" },
      { id: "cicilan", label: "SKEMA_CICILAN", desc: "Dev Path 1 (Cicilan Deposit)", type: "extension", color: "#ec4899" },
      { id: "renewal", label: "DRAFT_RENEWAL", desc: "Dev Path 2 (Masa Kontrak)", type: "extension", color: "#ec4899" },
    ];

    const row1Ids = ["sidara", "users", "kamar"];
    const row2Ids = ["staging", "penyewa", "renewal"];
    const row3Ids = ["cicilan", "pembayaran"];

    // Compute sizes & layout
    const nodesData = rawNodes.map(n => {
      const expanded = expandedNodes.has(n.id);
      const cols = colsMap[n.id] || [];
      const boxHeight = (expanded && cols.length > 0) ? baseBoxHeight + 15 + (cols.length * 18) + 15 : baseBoxHeight;
      return { ...n, expanded, cols, boxHeight, x: 0, y: 0 };
    });

    const row1Top = 60;
    const row1Max = Math.max(...nodesData.filter(n => row1Ids.includes(n.id)).map(n => n.boxHeight));
    
    const row2Top = row1Top + row1Max + 60;
    const row2Max = Math.max(...nodesData.filter(n => row2Ids.includes(n.id)).map(n => n.boxHeight));
    
    const row3Top = row2Top + row2Max + 60;
    const row3Max = Math.max(...nodesData.filter(n => row3Ids.includes(n.id)).map(n => n.boxHeight));
    
    const svgHeight = row3Top + row3Max + 80;
    svg.attr("height", svgHeight);

    nodesData.forEach(n => {
      // Columns (X-axis)
      if (["sidara", "staging", "cicilan"].includes(n.id)) n.x = 180;
      else if (["users", "penyewa", "pembayaran"].includes(n.id)) n.x = 512;
      else if (["kamar", "renewal"].includes(n.id)) n.x = 844;

      // Rows (Y-axis)
      if (row1Ids.includes(n.id)) n.y = row1Top + n.boxHeight / 2;
      else if (row2Ids.includes(n.id)) n.y = row2Top + n.boxHeight / 2;
      else if (row3Ids.includes(n.id)) n.y = row3Top + n.boxHeight / 2;
    });

    // Links Data
    const links = [
      { source: "sidara", target: "users", type: "sync", label: "Sync API" },
      { source: "users", target: "staging", type: "relation", label: "1:1 (Onboarding)" },
      { source: "users", target: "penyewa", type: "relation", label: "1:1 (Penghuni)" },
      
      { source: "staging", target: "pembayaran", type: "relation", label: "Tagihan Deposit" },
      { source: "penyewa", target: "pembayaran", type: "relation", label: "Tagihan Bulanan" },
      
      { source: "penyewa", target: "kamar", type: "relation", label: "N:1 (Menempati)" },
      
      { source: "pembayaran", target: "cicilan", type: "relation", label: "1:N (is_cicilan)" },
      
      { source: "penyewa", target: "renewal", type: "relation", label: "1:1 (Masa Kritis)" },
      { source: "renewal", target: "pembayaran", type: "relation", label: "Tagihan Baru" },

      { source: "staging", target: "penyewa", type: "migration", label: "Migrasi (Sync NIM & Lunas)" }
    ];

    const g = svg.append("g").attr("transform", "translate(0, 0)");

    // Helper: calculate edge point so lines don't pierce boxes
    function getEdgePoint(source: any, target: any, padding = 4) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const tw = boxWidth / 2 + padding;
      const th = target.boxHeight / 2 + padding;
      
      let x, y;
      if (Math.abs(dx) * th > Math.abs(dy) * tw) {
          x = dx > 0 ? -tw : tw;
          y = x * dy / dx;
      } else {
          y = dy > 0 ? -th : th;
          x = y * dx / dy;
      }
      return { x: target.x + x, y: target.y + y };
    }

    // Draw Links
    const linkGroups = g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        const sourceNode = nodesData.find(n => n.id === d.source);
        const targetNode = nodesData.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return "";
        
        const srcEdge = getEdgePoint(targetNode, sourceNode, 0); 
        const tgtEdge = getEdgePoint(sourceNode, targetNode, 8); 
        
        return `M${srcEdge.x},${srcEdge.y} L${tgtEdge.x},${tgtEdge.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.type === "migration" ? "#10b981" : d.type === "sync" ? "#3b82f6" : "#94a3b8")
      .attr("stroke-width", (d: any) => d.type === "sync" ? 3 : 2)
      .attr("stroke-dasharray", (d: any) => d.type === "migration" ? "6,6" : "none")
      .attr("marker-end", (d: any) => d.type === "migration" ? "url(#arrow-dashed)" : d.type === "sync" ? "url(#arrow-sync)" : "url(#arrow)")
      .style("opacity", (d: any) => (!isScenarioMode || (activeNodes.includes(d.source) && activeNodes.includes(d.target))) ? 1 : 0.1);

    // Add labels to links
    const linkLabelGroups = g.selectAll(".link-label")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .attr("x", (d: any) => {
        const sourceNode = nodesData.find(n => n.id === d.source);
        const targetNode = nodesData.find(n => n.id === d.target);
        return ((sourceNode?.x || 0) + (targetNode?.x || 0)) / 2;
      })
      .attr("y", (d: any) => {
        const sourceNode = nodesData.find(n => n.id === d.source);
        const targetNode = nodesData.find(n => n.id === d.target);
        return (((sourceNode?.y || 0) + (targetNode?.y || 0)) / 2) - 8;
      })
      .text((d: any) => d.label)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", (d: any) => d.type === "migration" ? "#059669" : d.type === "sync" ? "#2563eb" : "#64748b")
      .attr("font-weight", (d: any) => d.type === "migration" || d.type === "sync" ? "bold" : "normal")
      .style("background-color", "white")
      .style("opacity", (d: any) => (!isScenarioMode || (activeNodes.includes(d.source) && activeNodes.includes(d.target))) ? 1 : 0.1);

    // Draw Nodes
    const nodeGroups = g.selectAll(".node")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")
      .style("opacity", (d: any) => (!isScenarioMode || activeNodes.includes(d.id)) ? 1 : 0.2)
      .on("click", (event: any, d: any) => {
        setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(d.id)) next.delete(d.id);
          else next.add(d.id);
          return next;
        });
      });

    nodeGroups.append("title")
      .text("Klik untuk melihat/menyembunyikan detail kolom");

    // Node Box
    nodeGroups.append("rect")
      .attr("x", -boxWidth / 2)
      .attr("y", (d: any) => -d.boxHeight / 2)
      .attr("width", boxWidth)
      .attr("height", (d: any) => d.boxHeight)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "white")
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))");
      
    // Top Color Banner
    nodeGroups.append("path")
      .attr("d", (d: any) => `M${-boxWidth/2},${-d.boxHeight/2 + 20} L${boxWidth/2},${-d.boxHeight/2 + 20} L${boxWidth/2},${-d.boxHeight/2 + 8} Q${boxWidth/2},${-d.boxHeight/2} ${boxWidth/2 - 8},${-d.boxHeight/2} L${-boxWidth/2 + 8},${-d.boxHeight/2} Q${-boxWidth/2},${-d.boxHeight/2} ${-boxWidth/2},${-d.boxHeight/2 + 8} Z`)
      .attr("fill", (d: any) => d.color);

    // Node Type Label
    nodeGroups.append("text")
      .attr("x", 0)
      .attr("y", (d: any) => -d.boxHeight/2 + 13)
      .text((d: any) => d.type.toUpperCase())
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("fill", "white");

    // Node Title
    nodeGroups.append("text")
      .attr("x", 0)
      .attr("y", (d: any) => -d.boxHeight/2 + 35)
      .text((d: any) => d.label)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b");

    // Node Description
    nodeGroups.append("text")
      .attr("x", 0)
      .attr("y", (d: any) => -d.boxHeight/2 + 52)
      .text((d: any) => d.desc)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#64748b");

    // Divider Line if expanded
    nodeGroups.filter((d: any) => d.expanded && d.cols.length > 0)
      .append("line")
      .attr("x1", -boxWidth/2 + 15)
      .attr("y1", (d: any) => -d.boxHeight/2 + 65)
      .attr("x2", boxWidth/2 - 15)
      .attr("y2", (d: any) => -d.boxHeight/2 + 65)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    // Columns Group
    const colsGroup = nodeGroups.filter((d: any) => d.expanded && d.cols.length > 0)
      .append("g")
      .attr("transform", (d: any) => `translate(0, ${-d.boxHeight/2 + 85})`);

    colsGroup.each(function(d: any) {
      const g = d3.select(this);
      d.cols.forEach((col: any, i: number) => {
        const rowY = i * 18;
        
        // PK / FK Badge
        if (col.keyType) {
          g.append("text")
            .attr("x", -boxWidth/2 + 15)
            .attr("y", rowY)
            .text(col.keyType)
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", col.keyType === 'PK' ? "#eab308" : (col.keyType === 'FK' ? "#3b82f6" : "#8b5cf6"));
        }

        // Column Name
        g.append("text")
          .attr("x", -boxWidth/2 + (col.keyType ? 35 : 15))
          .attr("y", rowY)
          .text(col.name)
          .attr("font-size", "10px")
          .attr("font-weight", col.keyType === 'PK' ? "bold" : "normal")
          .attr("fill", "#334155");

        // Data Type
        g.append("text")
          .attr("x", boxWidth/2 - 15)
          .attr("y", rowY)
          .text(col.dataType)
          .attr("text-anchor", "end")
          .attr("font-size", "9px")
          .attr("fill", "#94a3b8")
          .attr("font-family", "monospace");
      });
    });

    // Expand/Collapse Caret Icon at the bottom
    nodeGroups.append("path")
      .attr("d", (d: any) => d.expanded 
        ? "M-4,2 L0,-2 L4,2" 
        : "M-4,-2 L0,2 L4,-2"
      )
      .attr("transform", (d: any) => `translate(0, ${d.boxHeight/2 - 12})`)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

    // Add Hover Interactivity
    nodeGroups
      .on("mouseenter", function(event: any, d: any) {
        if (isScenarioMode && !activeNodes.includes(d.id)) return;
        // Dim all nodes and links
        g.selectAll(".node").transition().duration(200).style("opacity", 0.1);
        g.selectAll(".link").transition().duration(200).style("opacity", 0.05);
        g.selectAll(".link-label").transition().duration(200).style("opacity", 0.05);
        
        // Highlight connected nodes and links
        const connectedNodes = new Set<string>();
        connectedNodes.add(d.id);
        
        g.selectAll(".link").filter((l: any) => {
          if (l.source === d.id || l.target === d.id) {
            connectedNodes.add(l.source);
            connectedNodes.add(l.target);
            return true;
          }
          return false;
        }).transition().duration(200).style("opacity", 1).attr("stroke-width", (l: any) => l.type === "sync" ? 4 : 3);
        
        g.selectAll(".link-label").filter((l: any) => l.source === d.id || l.target === d.id)
          .transition().duration(200).style("opacity", 1);
          
        g.selectAll(".node").filter((n: any) => connectedNodes.has(n.id))
          .transition().duration(200).style("opacity", 1);
      })
      .on("mouseleave", function() {
        // Restore all
        g.selectAll(".node").transition().duration(200).style("opacity", (n: any) => (!isScenarioMode || activeNodes.includes(n.id)) ? 1 : 0.2);
        g.selectAll(".link").transition().duration(200).style("opacity", (l: any) => (!isScenarioMode || (activeNodes.includes(l.source) && activeNodes.includes(l.target))) ? 1 : 0.1).attr("stroke-width", (l: any) => l.type === "sync" ? 3 : 2);
        g.selectAll(".link-label").transition().duration(200).style("opacity", (l: any) => (!isScenarioMode || (activeNodes.includes(l.source) && activeNodes.includes(l.target))) ? 1 : 0.1);
      });

    g.selectAll(".link, .link-label")
      .style("cursor", "pointer")
      .on("mouseenter", function(event: any, d: any) {
        if (isScenarioMode && (!activeNodes.includes(d.source) || !activeNodes.includes(d.target))) return;
        // Dim all
        g.selectAll(".node").transition().duration(200).style("opacity", 0.1);
        g.selectAll(".link").transition().duration(200).style("opacity", 0.05);
        g.selectAll(".link-label").transition().duration(200).style("opacity", 0.05);
        
        // Highlight this link and its label
        g.selectAll(".link").filter((l: any) => l.source === d.source && l.target === d.target)
          .transition().duration(200).style("opacity", 1).attr("stroke-width", (l:any) => l.type === "sync" ? 4 : 3);
        
        g.selectAll(".link-label").filter((l: any) => l.source === d.source && l.target === d.target)
          .transition().duration(200).style("opacity", 1);
          
        // Highlight source and target nodes
        g.selectAll(".node").filter((n: any) => n.id === d.source || n.id === d.target)
          .transition().duration(200).style("opacity", 1);
      })
      .on("mouseleave", function() {
        // Restore all
        g.selectAll(".node").transition().duration(200).style("opacity", (n: any) => (!isScenarioMode || activeNodes.includes(n.id)) ? 1 : 0.2);
        g.selectAll(".link").transition().duration(200).style("opacity", (l: any) => (!isScenarioMode || (activeNodes.includes(l.source) && activeNodes.includes(l.target))) ? 1 : 0.1).attr("stroke-width", (l: any) => l.type === "sync" ? 3 : 2);
        g.selectAll(".link-label").transition().duration(200).style("opacity", (l: any) => (!isScenarioMode || (activeNodes.includes(l.source) && activeNodes.includes(l.target))) ? 1 : 0.1);
      });

  }, [expandedNodes, activeScenario]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Database Schema Mapping
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Visualisasi pemetaan tabel staging (Portal Maba) ke tabel master (Sistem Manajemen Hunian Asrama)
            </p>
          </div>
          <button
            onClick={handleToggleExpandAll}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-colors shadow-sm whitespace-nowrap"
          >
            {expandAll ? 'Collapse All Tables' : 'Expand All Tables'}
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeScenario === s.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider border-r border-slate-200 pr-4">Legend</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-slate-400 relative">
                <div className="absolute -right-0.5 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-400 transform rotate-45"></div>
              </div>
              <span className="text-xs font-medium text-slate-600">Relasi (1:1 / 1:N)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t-2 border-dashed border-emerald-500 relative">
                <div className="absolute -right-0.5 -top-1.5 w-2 h-2 border-t-2 border-r-2 border-emerald-500 transform rotate-45"></div>
              </div>
              <span className="text-xs font-medium text-slate-600">Migrasi (Bersyarat)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t-[3px] border-blue-500 relative">
                <div className="absolute -right-0.5 -top-1 w-2.5 h-2.5 border-t-[3px] border-r-[3px] border-blue-500 transform rotate-45"></div>
              </div>
              <span className="text-xs font-medium text-slate-600">Sinkronisasi SIAKAD</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Klik tabel untuk detail</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/50 relative">
          <svg ref={svgRef} width="1024" className="mx-auto block" style={{ minHeight: '600px' }} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              Gateway & Identity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>SIDARA</strong> bertindak sebagai <em>Source of Truth</em>. Tabel <code>users</code> memverifikasi identitas dan menentukan arah <em>routing</em> (Maba vs Eksisting).
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              Staging & Booking
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              (Skenario 1 & 2). <code>staging_pendaftaran</code> mengamankan data pendaftar sebelum NIM valid turun (Maba) atau KYC selesai. Migrasi ke Master terjadi saat status <strong>BOOKING</strong> tervalidasi.
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              Operasional Asrama
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              (Skenario 3). <code>master_penyewa</code> dan <code>master_pembayaran</code> menampung <strong>Penghuni Aktif</strong>. Bersifat final dan terikat langsung pada tabel infrastruktur <code>kamar</code>.
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
            <h3 className="font-bold text-pink-900 text-sm flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              Jalur Dev Khusus
            </h3>
            <p className="text-xs text-pink-800 leading-relaxed">
              (Skenario 4 & 5). <code>skema_cicilan</code> memecah tagihan induk menjadi N-Termin. <code>draft_renewal</code> menjadi penengah sebelum kontrak aktif ditimpa (*overwrite*) pada masa perpanjangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

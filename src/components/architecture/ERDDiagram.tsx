import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const tables = [
  // STAGING TABLES (Frontend Maba Registration)
  { id: 'stg_maba', name: 'stg_maba (Staging)', columns: ['id (PK)', 'nim_noreg', 'nama_lengkap', 'nik_ktp', 'file_ktp_enc', 'status_kyc', 'province_id (FK)', 'regency_id (FK)'] },
  { id: 'stg_invoices', name: 'stg_invoices (Staging)', columns: ['id (PK)', 'stg_maba_id (FK)', 'kode_invoice', 'total_bayar', 'bukti_transfer', 'status'] },
  { id: 'stg_contracts', name: 'stg_contracts (Staging)', columns: ['id (PK)', 'stg_maba_id (FK)', 'room_id (FK)', 'wa_number', 'otp_verified', 'bastk_signed'] },
  
  // MASTER / REFERENCE TABLES (Backend Admin Laravel)
  { id: 'penyewa', name: 'penyewa (Master)', columns: ['id (PK)', 'nim', 'namalengkap', 'noktp', 'alamat', 'status_asrama', 'kamar_id (FK)'] },
  { id: 'users', name: 'users (Master SSO)', columns: ['id (PK)', 'identifier', 'name', 'role_id', 'password'] },
  { id: 'pembayaran', name: 'pembayaran (Master)', columns: ['id (PK)', 'no_invoice', 'penyewa_id (FK)', 'total_bayar', 'status_pembayaran'] },
  { id: 'kamar', name: 'kamar (Master)', columns: ['id (PK)', 'tipe_asrama_id', 'lantai_id (FK)', 'nomor_kamar', 'kapasitas', 'jumlah_penyewa'] },
  { id: 'lantai', name: 'lantai (Reference)', columns: ['id (PK)', 'nama'] },
  { id: 'provinces', name: 'provinces (Reference)', columns: ['id (PK)', 'name'] },
  { id: 'regencies', name: 'regencies (Reference)', columns: ['id (PK)', 'province_id (FK)', 'name'] },
  { id: 'delinquencies', name: 'delinquencies (Toleransi 5+5)', columns: ['id (PK)', 'user_id (FK)', 'due_date', 'days_overdue', 'stage', 'deposit_deducted', 'fine_amount', 'contract_terminated'] }
];

const relationships = [
  // Staging Relations
  { source: 'stg_invoices', target: 'stg_maba', label: 'stg_maba_id' },
  { source: 'stg_contracts', target: 'stg_maba', label: 'stg_maba_id' },
  { source: 'stg_contracts', target: 'kamar', label: 'room_id' },
  { source: 'stg_maba', target: 'provinces', label: 'province_id' },
  { source: 'stg_maba', target: 'regencies', label: 'regency_id' },
  
  // Master Relations
  { source: 'pembayaran', target: 'penyewa', label: 'penyewa_id' },
  { source: 'penyewa', target: 'kamar', label: 'kamar_id' },
  { source: 'kamar', target: 'lantai', label: 'lantai_id' },
  { source: 'regencies', target: 'provinces', label: 'province_id' },
  { source: 'delinquencies', target: 'users', label: 'user_id' },
  
  // MIGRATION RELATIONS (Opsi 1)
  { source: 'penyewa', target: 'stg_maba', label: 'MIGRATE (Verified)' },
  { source: 'users', target: 'stg_maba', label: 'MIGRATE (Account)' },
  { source: 'pembayaran', target: 'stg_invoices', label: 'MIGRATE (Paid)' }
];

export default function ERDDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth || 1000;
    const height = 1000;
    const nodeWidth = 240;
    const rowHeight = 25;
    const headerHeight = 35;

    const nodes = tables.map(t => ({
      ...t,
      width: nodeWidth,
      height: headerHeight + t.columns.length * rowHeight + 10,
    }));

    const links = relationships.map(d => ({ ...d }));

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Define arrow markers for directed links
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#94a3b8')
      .attr('d', 'M0,-5L10,0L0,5');

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(300))
      .force('charge', d3.forceManyBody().strength(-2000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 2 + 50));

    const linkGroup = svg.append('g').attr('stroke', '#94a3b8').attr('stroke-width', 2);
    
    const link = linkGroup.selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('marker-end', 'url(#end)');

    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '10px')
      .attr('fill', '#cbd5e1')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.label);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Table Container
    node.append('rect')
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 8)
      .attr('fill', (d: any) => d.name.includes('Master') ? '#0f172a' : '#1e293b')
      .attr('stroke', (d: any) => d.name.includes('Master') ? '#3b82f6' : '#475569')
      .attr('stroke-width', 1.5)
      .attr('x', d => -d.width / 2)
      .attr('y', d => -d.height / 2);

    // Header Background
    node.append('path')
      .attr('d', d => `
        M ${-d.width/2} ${-d.height/2 + headerHeight}
        L ${-d.width/2} ${-d.height/2 + 8}
        Q ${-d.width/2} ${-d.height/2} ${-d.width/2 + 8} ${-d.height/2}
        L ${d.width/2 - 8} ${-d.height/2}
        Q ${d.width/2} ${-d.height/2} ${d.width/2} ${-d.height/2 + 8}
        L ${d.width/2} ${-d.height/2 + headerHeight} Z
      `)
      .attr('fill', (d: any) => d.name.includes('Master') ? '#1e3a8a' : '#334155');

    // Header Text
    node.append('text')
      .attr('x', 0)
      .attr('y', d => -d.height / 2 + headerHeight / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8fafc')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(d => d.name);

    // Header line separator
    node.append('line')
      .attr('x1', d => -d.width / 2)
      .attr('y1', d => -d.height / 2 + headerHeight)
      .attr('x2', d => d.width / 2)
      .attr('y2', d => -d.height / 2 + headerHeight)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5);

    // Columns
    node.each(function(d: any) {
      const g = d3.select(this);
      d.columns.forEach((col: string, i: number) => {
        g.append('text')
          .attr('x', -d.width / 2 + 15)
          .attr('y', -d.height / 2 + headerHeight + 20 + i * rowHeight)
          .attr('fill', col.includes('(PK)') ? '#fcd34d' : col.includes('(FK)') ? '#93c5fd' : '#cbd5e1')
          .attr('font-size', '12px')
          .text(col);
      });
    });

    simulation.on('tick', () => {
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        // Basic line calculation
        return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
      });

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 5);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

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

  }, []);

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Database ERD Visualization</h3>
        <p className="text-slate-400 text-sm">Interactive Entity-Relationship Diagram for Asrama UBT. Drag nodes to reposition.</p>
      </div>
      <div 
        ref={containerRef} 
        className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner"
      />
    </div>
  );
}

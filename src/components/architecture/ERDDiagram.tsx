import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const tables = [
  // 1. STAGING BRIDGING TABLES (Pendaftaran Mandiri Maba - operator_id = 0)
  { 
    id: 'request_pembayaran', 
    name: 'request_pembayaran (Staging)', 
    columns: ['id (PK)', 'no_request (UK)', 'penyewa_id (FK)', 'kamar_id (FK)', 'durasi', 'total_tagihan', 'total_bayar', 'status_pembayaran', 'status_verifikasi', 'operator_id=0'] 
  },
  { 
    id: 'request_pembayaran_detail', 
    name: 'request_pembayaran_detail (Staging)', 
    columns: ['id (PK)', 'no_request (FK)', 'harga_id (FK)', 'jenissewa', 'harga', 'qty', 'jumlah_pembayaran', 'status'] 
  },
  { 
    id: 'request_transaksi', 
    name: 'request_transaksi (Staging)', 
    columns: ['id (PK)', 'no_request (FK)', 'no_transaksi', 'tanggal_transaksi', 'jumlah_uang', 'metode_pembayaran', 'file_bukti', 'operator_id=0'] 
  },
  
  // 2. MASTER RUNNING TABLES (Pencatatan Berjalan Web Admin - operator_id = Admin)
  { 
    id: 'penyewa', 
    name: 'penyewa (Master Penghuni)', 
    columns: ['id (PK)', 'nim (UK)', 'namalengkap', 'noktp', 'nohp', 'jenis_kelamin', 'status_asrama', 'status', 'kamar_id (FK)', 'operator_id'] 
  },
  { 
    id: 'pembayaran', 
    name: 'pembayaran (Master Invoice)', 
    columns: ['id (PK)', 'no_invoice (UK)', 'penyewa_id (FK)', 'kamar_id (FK)', 'durasi', 'total_tagihan', 'total_bayar', 'status_pembayaran', 'operator_id'] 
  },
  { 
    id: 'pembayaran_detail', 
    name: 'pembayaran_detail (Master)', 
    columns: ['id (PK)', 'no_invoice (FK)', 'harga_id (FK)', 'jenissewa', 'harga', 'qty', 'jumlah_pembayaran', 'status'] 
  },
  { 
    id: 'transaksi', 
    name: 'transaksi (Master Kas Berjalan)', 
    columns: ['id (PK)', 'no_invoice (FK)', 'penyewa_id (FK)', 'no_transaksi', 'tanggal_transaksi', 'jumlah_uang', 'metode_pembayaran', 'file_bukti', 'operator_id'] 
  },
  { 
    id: 'kamar', 
    name: 'kamar (Infrastruktur)', 
    columns: ['id (PK)', 'tipe_asrama_id (FK)', 'lantai_id (FK)', 'nomor_kamar', 'kapasitas', 'jumlah_penyewa'] 
  },
  { 
    id: 'users', 
    name: 'users (Master Akun SSO)', 
    columns: ['id (PK)', 'nim (UK)', 'name', 'email', 'role', 'password'] 
  },
  { 
    id: 'delinquencies', 
    name: 'delinquencies (SOP 5+5)', 
    columns: ['id (PK)', 'user_id (FK)', 'due_date', 'days_overdue', 'stage', 'deposit_deducted', 'fine_amount'] 
  },
  
  // 3. INTEGRASI API SIAKAD UBT (Pra-Registrasi)
  { 
    id: 'api_link', 
    name: 'api_link (Endpoint SIAKAD)', 
    columns: ['id (PK)', 'jenis', 'kategori (nonkip/kip)', 'link', 'nama', 'total_records', 'last_synced_at'] 
  },
  { 
    id: 'siakad_mahasiswa_stg', 
    name: 'siakad_mahasiswa_stg (Staging Pra-Registrasi)', 
    columns: ['id (PK)', 'api_link_id (FK)', 'nomor_registrasi (UK)', 'nama_lengkap', 'nik', 'kategori_beasiswa', 'status_klaim', 'status_verifikasi_subsidi'] 
  },

  // 4. STORAGE PRIVAT e-KYC BERVERSI & AUDIT TRAIL FORENSIK (RULE[AGENTS_md])
  { 
    id: 'kyc_documents', 
    name: 'kyc_documents (Private Bucket & Versioning)', 
    columns: ['id (PK)', 'user_id (FK)', 'penyewa_id (FK)', 'doc_type', 'file_name', 'file_path', 'file_version (Immutable)', 'file_hash (SHA256)', 'status_verifikasi', 'retention_until (60 Days)'] 
  },
  { 
    id: 'modification_logs', 
    name: 'modification_logs (Audit Trail Forensik)', 
    columns: ['id (PK)', 'trackable_type', 'trackable_id', 'actor_type', 'actor_id (FK)', 'action', 'old_values (JSON)', 'new_values (JSON)', 'ip_address', 'created_at'] 
  }
];

const relationships = [
  // Staging Relations
  { source: 'request_pembayaran_detail', target: 'request_pembayaran', label: 'no_request (FK)' },
  { source: 'request_transaksi', target: 'request_pembayaran', label: 'no_request (FK)' },
  { source: 'request_pembayaran', target: 'penyewa', label: 'penyewa_id (FK)' },
  { source: 'request_pembayaran', target: 'kamar', label: 'kamar_id (FK)' },

  // Master Running Relations
  { source: 'pembayaran_detail', target: 'pembayaran', label: 'no_invoice (FK)' },
  { source: 'transaksi', target: 'pembayaran', label: 'no_invoice (FK)' },
  { source: 'pembayaran', target: 'penyewa', label: 'penyewa_id (FK)' },
  { source: 'transaksi', target: 'penyewa', label: 'penyewa_id (FK)' },
  { source: 'penyewa', target: 'kamar', label: 'kamar_id (FK)' },
  { source: 'penyewa', target: 'users', label: 'nim (FK)' },
  { source: 'delinquencies', target: 'users', label: 'user_id (FK)' },

  // SIAKAD Integration
  { source: 'siakad_mahasiswa_stg', target: 'api_link', label: 'api_link_id (FK)' },
  { source: 'penyewa', target: 'siakad_mahasiswa_stg', label: 'AUTO-FILL PMB' },

  // e-KYC & Audit Trail Relations
  { source: 'kyc_documents', target: 'users', label: 'user_id (FK)' },
  { source: 'kyc_documents', target: 'penyewa', label: 'penyewa_id (FK)' },
  { source: 'modification_logs', target: 'users', label: 'actor_id (FK)' },
  { source: 'modification_logs', target: 'kyc_documents', label: 'trackable_id (FK)' },

  // Bridging Migration Flow (Verifikasi & Promosi Admin)
  { source: 'pembayaran', target: 'request_pembayaran', label: 'BRIDGING PROMOTE' },
  { source: 'pembayaran_detail', target: 'request_pembayaran_detail', label: 'COPY DETAILS' },
  { source: 'transaksi', target: 'request_transaksi', label: 'RECORD OFFICIAL TRX' }
];

export default function ERDDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth || 1000;
    const height = 1150;
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

export type MaintenanceCategory = 
  | 'plumbing'         // Pipa, Kran, Saluran Air, Sanitasi
  | 'electrical'       // Stopkontak, Saklar, Lampu, Sekring
  | 'furniture'        // Meja, Kursi, Lemari, Ranjang Kasur
  | 'hvac_fan'         // Kipas Angin, Ventilasi, Exhaust
  | 'doors_windows'    // Kunci Pintu, Engsel, Jendela, Grendel
  | 'civil_structure'  // Plafon Bocor, Cat Mengelupas, Ubin Lantai
  | 'cleaning_waste'   // Kebersihan & Tempat Sampah Komunal
  | 'other';           // Lain-lain

export type DamageUrgency = 'low' | 'medium' | 'high' | 'emergency';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export type TicketStatus = 
  | 'SUBMITTED'    // Menunggu Verifikasi Admin/Teknisi
  | 'VERIFIED'     // Terverifikasi & Dijadwalkan
  | 'IN_PROGRESS'  // Teknisi Sedang Menangani
  | 'COMPLETED'    // Perbaikan Selesai
  | 'CANCELLED';   // Dibatalkan oleh Pelapor

export interface TicketStatusHistory {
  id: string;
  status: TicketStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface AssignedTechnician {
  name: string;
  role: string;
  phone: string;
  avatar?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketCode: string; // e.g. TKT-2026-0842
  reporterNim: string;
  reporterName: string;
  reporterPhone: string;
  locationBuilding: string; // 'Gedung A (Enggang Utara)' | 'Gedung B (Enggang Selatan)'
  locationFloor: string;    // 'Lantai 1' | 'Lantai 2' | 'Lantai 3'
  locationRoom: string;     // e.g. 'Kamar 101'
  category: MaintenanceCategory;
  urgency: DamageUrgency;
  priority?: TicketPriority;
  title: string;
  description: string;
  photoUrl?: string;
  photoCapturedAt?: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  assignedTechnician?: AssignedTechnician;
  scheduledDate?: string;
  technicianNotes?: string;
  resolutionPhotoUrl?: string;
  statusHistory: TicketStatusHistory[];
}

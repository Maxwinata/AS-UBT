export type AnnouncementCategory = 
  | 'general'       // Pengumuman Umum
  | 'facility'      // Sarana & Prasarana
  | 'maintenance'   // Pemeliharaan & Darurat
  | 'finance'       // Keuangan & Tarif
  | 'security';     // Keamanan & Tata Tertib

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface BoardAnnouncement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  targetAudience: string;
  author: string;
  authorRole: string;
  publishedAt: string; // ISO String or readable date
  isPinned?: boolean;
  actionText?: string;
  actionTag?: string;
}

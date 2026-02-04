export type ColumnId = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Accepted' | 'Rejected';

export interface Application {
  id: string;
  title: string;
  company: string;
  status: ColumnId;
  location: string;
  rate?: string;
  notes?: string;
  createdAt: number; // Timestamp
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const COLUMNS: ColumnId[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Accepted', 'Rejected'];

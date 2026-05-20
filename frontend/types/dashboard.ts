export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  oaPending: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offersReceived: number;
  rejectedCount: number;
  rejectionRate: number;
  activeCooldowns: number;
  pendingFollowups: number;
}

export interface Reminder {
  type: string;
  title: string;
  message: string;
  dueDate?: string;
  applicationId?: number;
  interviewId?: number;
  contactId?: number;
  companyName?: string;
}

export interface TimelineEvent {
  id: number;
  applicationId: number;
  userId: number;
  event: string;
  notes?: string;
  eventDate: string;
  createdAt: string;
}

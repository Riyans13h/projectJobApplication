export type ContactType = "REFERRAL" | "RECRUITER" | "HR" | "HIRING_MANAGER" | "MENTOR" | "COLD_MAIL" | "ALUMNI" | "FRIEND";
export type ContactStatus = "NOT_CONTACTED" | "MESSAGE_SENT" | "RESPONDED" | "REFERRAL_GIVEN" | "REJECTED" | "FOLLOW_UP_NEEDED";
export type HelpScore = "ZERO" | "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX" | "SEVEN" | "EIGHT" | "NINE" | "TEN";

export interface Contact {
  id: number;
  userId: number;
  name: string;
  company?: string;
  role?: string;
  level?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  contactType: ContactType;
  status: ContactStatus;
  helpScore?: HelpScore;
  source?: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPayload {
  name: string;
  company?: string;
  role?: string;
  level?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  contactType: ContactType;
  status?: ContactStatus;
  helpScore?: HelpScore;
  source?: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowupDate?: string;
}

export interface ContactListParams {
  page?: number;
  size?: number;
  name?: string;
  company?: string;
  contactType?: ContactType | "";
  status?: ContactStatus | "";
  helpScore?: HelpScore | "";
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

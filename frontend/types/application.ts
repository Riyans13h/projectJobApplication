export type ApplicationStatus =
  | "APPLIED"
  | "OA_RECEIVED"
  | "OA_SUBMITTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_IN_PROGRESS"
  | "INTERVIEW_COMPLETED"
  | "OFFER_RECEIVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "HOLD";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type WorkMode = "REMOTE" | "ONSITE" | "HYBRID";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

export interface Application {
  id: number;
  userId: number;
  companyName: string;
  role: string;
  jobId?: string;
  location?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  status: ApplicationStatus;
  priority: Priority;
  applicationDate: string;
  appliedThrough?: string;
  emailUsed?: string;
  phoneUsed?: string;
  notes?: string;
  cooldownPeriod?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationPayload {
  companyName: string;
  role: string;
  jobId?: string;
  location?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  status: ApplicationStatus;
  priority?: Priority;
  applicationDate: string;
  appliedThrough?: string;
  emailUsed?: string;
  phoneUsed?: string;
  notes?: string;
  cooldownPeriod?: number;
}

export interface ApplicationListParams {
  page?: number;
  size?: number;
  company?: string;
  role?: string;
  status?: ApplicationStatus | "";
  priority?: Priority | "";
}

export interface ApplicationUploadFiles {
  resume?: FileList | null;
  jd?: FileList | null;
  coverLetter?: FileList | null;
}

export interface FileUploadResponse {
  fileId: number;
  fileType: "RESUME" | "JD" | "COVER_LETTER" | string;
  originalFileName: string;
  storedFileName: string;
  publicId: string;
  fileUrl: string;
  downloadUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  message: string;
}

export type InterviewMode = "PHONE" | "VIDEO" | "ONSITE" | "ONLINE_ASSESSMENT";
export type InterviewResult = "PENDING" | "PASSED" | "REJECTED" | "CANCELLED" | "NO_SHOW";

export interface Interview {
  id: number;
  applicationId: number;
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  result: InterviewResult;
  notes?: string;
  createdAt: string;
}

export interface TimelineEntry {
  id: number;
  applicationId: number;
  event: string;
  notes?: string;
  eventDate: string;
  createdAt: string;
}

export interface CooldownInfo {
  companyName: string;
  lastAppliedDate?: string;
  cooldownPeriod: number;
  eligibleReapplyDate?: string;
  cooldownActive: boolean;
  daysRemaining: number;
  message: string;
}

export interface ApplicationStats {
  totalApplications: number;
  appliedCount: number;
  oaReceivedCount: number;
  interviewScheduledCount: number;
  offersCount: number;
  rejectedCount: number;
  highPriorityCount: number;
  activeCooldownCount: number;
}

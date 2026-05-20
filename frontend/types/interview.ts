import type { Application, InterviewMode, InterviewResult } from "@/types/application";

export type { InterviewMode, InterviewResult };

export interface Interview {
  id: number;
  applicationId: number;
  userId?: number;
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  result: InterviewResult;
  notes?: string;
  createdAt: string;
}

export interface InterviewPayload {
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  result?: InterviewResult;
  notes?: string;
}

export interface InterviewWithApplication extends Interview {
  application?: Application;
  companyName?: string;
  role?: string;
}

export interface InterviewFilters {
  search: string;
  result: InterviewResult | "";
  mode: InterviewMode | "";
}

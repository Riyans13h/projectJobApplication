export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  error: string;
  validationErrors?: Record<string, string>;
}

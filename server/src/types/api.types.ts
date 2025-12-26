export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  status: number;
}

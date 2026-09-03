// core/infrastructure/api-response.ts
export interface ApiResponse<T> {
  data: T;
  meta?: { page: number; total: number };
}
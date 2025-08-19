export interface ApiResponse<T> {
  success: number;
  code: number;
  meta: {
    endpoint: string;
    method: string;
  };
  data: T;
  message: string;
}
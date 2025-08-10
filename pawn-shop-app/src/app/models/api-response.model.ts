export interface ApiResponse<T> {
  success: number;
  code: number;
  message: string;
  data: T;
}
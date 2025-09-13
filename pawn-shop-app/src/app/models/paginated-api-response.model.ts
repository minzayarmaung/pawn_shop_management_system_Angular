export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedApiResponse<T> {
  success: number;
  code: number;
  message: string;
  meta: PaginationMeta;
  data: T[];
}

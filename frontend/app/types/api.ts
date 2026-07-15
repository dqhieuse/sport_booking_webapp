export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | Record<string, string>;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  errors?: string[] | Record<string, string>;
};

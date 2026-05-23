export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  errors?: string[];
};

export type ApiFailureResponse = {
  success: false;
  message: string;
  errors: string[];
  data?: null;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export type ApiErrorPayload = {
  message: string;
  errors: string[];
  status?: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

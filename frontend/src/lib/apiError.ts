import axios from 'axios';

import type { ApiErrorPayload, ApiResponse } from '@/types/api';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export class ApiError extends Error {
  errors: string[];
  status?: number;

  constructor({ message, errors, status }: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.status = status;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const responseData = error.response?.data;

    return new ApiError({
      message: responseData?.message || error.message || DEFAULT_ERROR_MESSAGE,
      errors: responseData?.errors ?? [],
      status: error.response?.status,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || DEFAULT_ERROR_MESSAGE,
      errors: [],
    });
  }

  return new ApiError({
    message: DEFAULT_ERROR_MESSAGE,
    errors: [],
  });
}

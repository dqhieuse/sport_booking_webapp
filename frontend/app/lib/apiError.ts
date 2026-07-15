import type { ApiErrorBody } from "~/types/api";

export class ApiError extends Error {
  status: number;
  errors?: string[] | Record<string, string>;

  constructor(status: number, body?: ApiErrorBody) {
    super(body?.message ?? "Không thể kết nối máy chủ.");
    this.name = "ApiError";
    this.status = status;
    this.errors = body?.errors;
  }
}

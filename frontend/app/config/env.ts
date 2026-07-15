export const appEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  appName: import.meta.env.VITE_APP_NAME ?? "SportZone",
} as const;

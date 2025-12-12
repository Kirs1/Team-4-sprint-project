// Central place to read the backend base URL so all fetches stay consistent.
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  "http://127.0.0.1:8000";

// Normalize to avoid double slashes when concatenating paths.
export const API_BASE = rawBase.replace(/\/+$/, "");

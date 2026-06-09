/**
 * Unified API client for Aaradhya Real Estate
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.aaradhyadreamcity.in";

export class APIError extends Error {
  status: number;
  detail: string;
  code: string;

  constructor(status: number, detail: string, code: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.code = code;
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // Session expired or unauthorized
    localStorage.removeItem("access_token");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login?expired=true";
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new APIError(
      response.status,
      data.detail || "An unexpected error occurred",
      data.code || "HTTP_ERROR"
    );
  }

  return data;
}

export const endpoints = {
  register: "/broker/register",
  login: "/broker/login",
  me: "/broker/me",
  addSale: "/sales/add",
  monthlyReport: "/sales/monthly-report",
  userLookup: "/broker/admin/user",
  setPrivilege: "/broker/admin/set-privilege",
  allUsers: "/broker/admin/users",
};

/**
 * Unified API client for Aaradhya Real Estate
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://test.aaradhyadreamcity.in";

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

export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function clearSessionData() {
  if (typeof window !== "undefined") {
    // Clear access token cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Clear localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }

    // Clear sessionStorage, preserving theme context if exists
    try {
      const theme = sessionStorage.getItem("theme");
      sessionStorage.clear();
      if (theme) {
        sessionStorage.setItem("theme", theme);
      }
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e);
    }
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getCookie("access_token");

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // Session expired or unauthorized
    clearSessionData();
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
  soldPlots: "/sales/sold-plots",
  editUser: "/broker/user/edit",
  addPayout: "/sales/payout/add",
  payoutsList: "/sales/payouts",
  plotInfo: "/sales/plot/",
  updatePassword: "/broker/password/update",
};


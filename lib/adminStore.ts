"use client";

// Define the shape of an Action Log
export interface AdminLog {
  id: string;
  date: string;
  time: string;
  adminName: string;
  action: string;
}

// Define the shape of Associate Policy (Limit, Suspended, Warnings, Levels)
export interface AssociatePolicy {
  suspended: boolean;
  limit: number | null;
  warnings: string[];
  level?: number | null;
}

const LOGS_KEY = "aaradhya_admin_logs";
const POLICIES_KEY = "aaradhya_associate_policies";
const VISITS_KEY = "aaradhya_website_visits";

// -- Admin Logs --

export function getAdminLogs(): AdminLog[] {
  return [];
}

export function addAdminLog(adminName: string, action: string) {
  if (typeof window === "undefined") return;
  const logs = getAdminLogs();
  const now = new Date();
  
  const newLog: AdminLog = {
    id: now.getTime().toString() + Math.floor(Math.random() * 1000),
    date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    adminName: adminName || "Unknown Admin",
    action
  };
  
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
}

// -- Associate Policies --

const encodeBase64 = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
};

const decodeBase64 = (str: string) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return atob(str);
  }
};

export function getAllAssociatePolicies(): Record<string, AssociatePolicy> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(POLICIES_KEY);
  if (raw) {
    try {
      const isBase64 = !raw.trim().startsWith("{") && !raw.trim().startsWith("[");
      const decodedStr = isBase64 ? decodeBase64(raw) : raw;
      const parsed = JSON.parse(decodedStr);
      
      // Auto-migrate old plain text records to obfuscated format
      if (!isBase64) {
        localStorage.setItem(POLICIES_KEY, encodeBase64(decodedStr));
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse associate policies", e);
    }
  }
  return {};
}

export function getAssociatePolicy(userId: string): AssociatePolicy {
  const policies = getAllAssociatePolicies();
  return policies[userId] || { suspended: false, limit: null, warnings: [] };
}

export function updateAssociatePolicy(userId: string, updates: Partial<AssociatePolicy>) {
  if (typeof window === "undefined") return;
  const policies = getAllAssociatePolicies();
  const current = policies[userId] || { suspended: false, limit: null, warnings: [] };
  
  policies[userId] = { ...current, ...updates };
  localStorage.setItem(POLICIES_KEY, encodeBase64(JSON.stringify(policies)));
}

export function addAssociateWarning(userId: string, warning: string) {
  if (typeof window === "undefined") return;
  const policies = getAllAssociatePolicies();
  const current = policies[userId] || { suspended: false, limit: null, warnings: [] };
  
  current.warnings = [...current.warnings, warning];
  policies[userId] = current;
  localStorage.setItem(POLICIES_KEY, encodeBase64(JSON.stringify(policies)));
}

export function clearAssociateWarnings(userId: string) {
  if (typeof window === "undefined") return;
  const policies = getAllAssociatePolicies();
  const current = policies[userId] || { suspended: false, limit: null, warnings: [] };
  
  current.warnings = [];
  policies[userId] = current;
  localStorage.setItem(POLICIES_KEY, encodeBase64(JSON.stringify(policies)));
}

// -- Website Visits --

export function getWebsiteVisits(): number {
  if (typeof window === "undefined") return 14850;
  const raw = localStorage.getItem(VISITS_KEY);
  if (raw) {
    return parseInt(raw, 10);
  }
  
  // Set an initial realistic number
  const initial = 14850 + Math.floor(Math.random() * 100);
  localStorage.setItem(VISITS_KEY, initial.toString());
  return initial;
}

export function incrementWebsiteVisits() {
  if (typeof window === "undefined") return;
  const current = getWebsiteVisits();
  localStorage.setItem(VISITS_KEY, (current + 1).toString());
  
  fetch("https://abacus.jasoncameron.dev/hit/aaradhyadreamcity/visits")
    .catch(() => console.warn("Failed to increment visits counter (offline)"));
}

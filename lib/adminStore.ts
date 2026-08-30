"use client";


export interface AdminLog {
  id: string;
  date: string;
  time: string;
  adminName: string;
  action: string;
}

export interface AssociatePolicy {
  suspended: boolean;
  limit: number | null;
  warnings: string[];
  level?: number | null;
}

const POLICIES_KEY = "aaradhya_associate_policies";


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

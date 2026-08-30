"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints, getCookie, clearSessionData } from "./api";
import { getAssociatePolicy } from "./adminStore";

/**
 * Verifies the JWT session exists and is valid by calling /broker/me.
 *
 * @param redirectIfValid     - Path to redirect to if a valid session exists (use on login/register pages)
 * @param redirectIfInvalid   - Path to redirect to if no valid session (use on protected pages)
 * @param redirectBasedOnRole - If true, redirects to the role-specific dashboard on valid session
 * @param requiredRole        - If set, redirects to /login if the user's role does not match
 */
export function useAuth(options?: {
  redirectIfValid?: string;
  redirectIfInvalid?: string;
  redirectBasedOnRole?: boolean;
  requiredRole?: string | string[];
}) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  // Use a ref so the effect only runs once on mount, not on every pathname change.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifySession = async () => {

      const token = getCookie("access_token");

      if (!token) {
        setStatus("unauthenticated");
        if (options?.redirectIfInvalid) {
          router.replace(options.redirectIfInvalid);
        }
        return;
      }

      try {
        const data = await apiFetch(endpoints.me);
        
        // Normalize role and admin properties for database alignment
        if (data) {
          if (data.admin !== undefined && data.is_admin === undefined) {
            data.is_admin = data.admin;
          }
          if (data.super_admin !== undefined && data.is_super_admin === undefined) {
            data.is_super_admin = data.super_admin;
          }
          if (!data.role) {
            if (data.super_admin === true || data.is_super_admin === true) {
              data.role = "SUPERADMIN";
            } else if (data.admin === true || data.is_admin === true) {
              data.role = "ADMIN";
            } else {
              data.role = "ASSOCIATE";
            }
          }
          
          // Apply level override
          const policy = getAssociatePolicy(data._id || data.id);
          if (policy && policy.level !== undefined && policy.level !== null) {
            data.level = policy.level;
          }
        }

        // Check if account is suspended
        if (data && (data.account_active === false || data.account_enabled === false)) {
          clearSessionData();
          setStatus("unauthenticated");
          router.replace("/login?suspended=true");
          return;
        }

        setProfile(data);
        setStatus("authenticated");

        // Role guard — if requiredRole is set and user role doesn't match, kick them out
        if (options?.requiredRole) {
          const allowed = Array.isArray(options.requiredRole)
            ? options.requiredRole
            : [options.requiredRole];
          const allowedUpper = allowed.map((r) => r.toUpperCase());
          const userRoleRaw = data.role || "ASSOCIATE";
          const userRole = userRoleRaw.toUpperCase();
          if (!allowedUpper.includes(userRole)) {
            // Redirect to dashboard
            router.replace("/dashboard");
            return;
          }
        }

        // Role-based redirect (e.g. on the login page)
        if (options?.redirectBasedOnRole) {
          router.replace("/dashboard");
        } else if (options?.redirectIfValid) {
          router.replace(options.redirectIfValid);
        }
      } catch {
        clearSessionData();
        setStatus("unauthenticated");
        if (options?.redirectIfInvalid) {
          router.replace(options.redirectIfInvalid);
        }
      }
    };

    verifySession();

    // Active session heartbeat and tab focus check to detect suspension or invalidation immediately
    const checkActiveSession = async () => {
      const token = getCookie("access_token");
      if (!token) return;

      try {
        const data = await apiFetch(endpoints.me);
        if (data && (data.account_active === false || data.account_enabled === false)) {
          clearSessionData();
          setStatus("unauthenticated");
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login?suspended=true";
          }
        }
      } catch (err: any) {
        // apiFetch automatically handles 401 and 403 suspension redirection
      }
    };

    const intervalId = setInterval(checkActiveSession, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkActiveSession();
      }
    };

    window.addEventListener("focus", checkActiveSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", checkActiveSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, profile };
}


"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints, getCookie, clearSessionData } from "./api";

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
            // Redirect to their correct dashboard instead of just /login
            if (userRole === "SUPERADMIN") router.replace("/superadmin");
            else if (userRole === "ADMIN") router.replace("/admin");
            else if (userRole === "OFFICE") router.replace("/office");
            else router.replace("/dashboard");
            return;
          }
        }

        // Role-based redirect (e.g. on the login page)
        if (options?.redirectBasedOnRole) {
          const roleRaw = data.role || "ASSOCIATE";
          const role = roleRaw.toUpperCase();
          if (role === "SUPERADMIN") router.replace("/superadmin");
          else if (role === "ADMIN") router.replace("/admin");
          else if (role === "OFFICE") router.replace("/office");
          else router.replace("/dashboard");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, profile };
}


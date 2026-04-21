"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, endpoints } from "./api";

/**
 * Verifies the JWT session exists and is valid by calling /broker/me.
 *
 * @param redirectIfValid - Path to redirect to if a valid session exists (use on login/register pages)
 * @param redirectIfInvalid - Path to redirect to if no valid session (use on protected pages)
 */
export function useAuth(options?: {
  redirectIfValid?: string;
  redirectIfInvalid?: string;
}) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("access_token");

      // No token at all — skip API call
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

        // e.g. on login page, if already authenticated, redirect to dashboard
        if (options?.redirectIfValid) {
          router.replace(options.redirectIfValid);
        }
      } catch {
        // Token is invalid or expired — clean up
        localStorage.removeItem("access_token");
        setStatus("unauthenticated");

        if (options?.redirectIfInvalid) {
          router.replace(options.redirectIfInvalid);
        }
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return { status, profile };
}

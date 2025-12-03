import { useState, useEffect } from "react";

const COOKIE_KEY = "isScoreboardOpen";

// --- Cookie helpers ---
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

// --- Hook ---
export function useLeaderboardCache(defaultOpen: boolean) {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // ✅ read cookie on initialization (no flicker, no fallback issue)
    const cookieValue = getCookie(COOKIE_KEY);
    if (cookieValue !== null) {
      return cookieValue === "true";
    }
    return defaultOpen;
  });

  useEffect(() => {
    // ✅ sync cookie whenever it changes
    setCookie(COOKIE_KEY, String(isOpen));
  }, [isOpen]);

  return [isOpen, setIsOpen] as const;
}


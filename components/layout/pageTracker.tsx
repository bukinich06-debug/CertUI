"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const PageTracker = () => {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const body = JSON.stringify({ path: pathname });
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/track", blob);
  }, [pathname]);

  return null;
};

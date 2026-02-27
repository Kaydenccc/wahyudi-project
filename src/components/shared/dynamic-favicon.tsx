"use client";

import { useEffect } from "react";
import { useBranding } from "@/hooks/use-branding";

export function DynamicFavicon() {
  const { branding } = useBranding();

  useEffect(() => {
    // Use favicon if set, otherwise fall back to club logo
    const iconUrl = branding.favicon || branding.logo || "/logo.jpeg";

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  }, [branding.favicon, branding.logo]);

  return null;
}

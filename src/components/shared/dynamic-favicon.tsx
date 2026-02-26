"use client";

import { useEffect } from "react";
import { useBranding } from "@/hooks/use-branding";

export function DynamicFavicon() {
  const { branding } = useBranding();

  useEffect(() => {
    if (!branding.favicon) return;

    // Update or create favicon link element
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.favicon;
  }, [branding.favicon]);

  return null;
}

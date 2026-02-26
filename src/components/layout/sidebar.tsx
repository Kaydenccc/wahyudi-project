"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getMenuForRole,
  settingsItem,
  canSeeSettings,
  APP_NAME,
  APP_SUBTITLE,
} from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { ShuttlecockIcon } from "@/components/icons/shuttlecock";
import { useSession } from "@/hooks/use-session";
import { useBranding } from "@/hooks/use-branding";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  const { branding } = useBranding();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Program Latihan"]);

  const role = user?.role || "Atlet";
  const visibleMenuItems = getMenuForRole(role);
  const showSettings = canSeeSettings(role);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Collect all known menu hrefs for "most specific match" logic
  const allHrefs: string[] = visibleMenuItems.flatMap((item) => [
    ...(item.href ? [item.href] : []),
    ...(item.children?.map((c) => c.href) || []),
  ]);
  if (settingsItem.href) allHrefs.push(settingsItem.href);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (pathname === href) return true;
    if (!pathname.startsWith(href + "/")) return false;
    // Only match if no other menu href is a more specific match
    return !allHrefs.some(
      (h) => h !== href && h.startsWith(href) && pathname.startsWith(h)
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 overflow-hidden shrink-0">
          {branding.logo ? (
            <img src={branding.logo} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <ShuttlecockIcon className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h1 className="font-bold text-foreground text-lg leading-tight">{APP_NAME}</h1>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">{APP_SUBTITLE}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = hasChildren
            ? item.children!.some((child) => isActive(child.href))
            : isActive(item.href);

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(child.href)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {child.icon && <child.icon className="h-4 w-4" />}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom - only for Admin & Ketua Klub */}
      {showSettings && (
        <div className="border-t border-border px-3 py-3">
          <Link
            href={settingsItem.href!}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(settingsItem.href)
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <settingsItem.icon className="h-5 w-5" />
            {settingsItem.label}
          </Link>
        </div>
      )}
    </aside>
  );
}

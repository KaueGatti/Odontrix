import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  size?: "sm" | "md";
}

export function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  size = "md",
}: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className={cn(size === "sm" ? "p-4" : "p-[18px]")}>
          <div
            className={cn(
              "mb-[10px] flex items-center justify-center rounded-[9px]",
              size === "sm" ? "h-7 w-7" : "h-8 w-8",
              iconBg,
            )}
          >
            <Icon
              className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")}
              style={{ color: iconColor }}
            />
          </div>
          <p className={cn("text-muted-foreground", size === "sm" ? "mb-[3px] text-[10px]" : "mb-1 text-[11px]")}>
            {label}
          </p>
          <p
            className={cn(
              "font-bold tracking-tight text-foreground",
              size === "sm" ? "text-[17px]" : "text-xl",
            )}
          >
            {value}
          </p>
          {sub && (
            <p className={cn("mt-1 text-muted-foreground/70", size === "sm" ? "text-[9.5px]" : "text-[10.5px]")}>
              {sub}
            </p>
          )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

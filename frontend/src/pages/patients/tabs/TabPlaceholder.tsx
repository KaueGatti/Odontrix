import { Construction } from "lucide-react";

interface TabPlaceholderProps {
  title: string;
}

export function TabPlaceholder({ title }: TabPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-9 py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Construction className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Essa aba ainda não foi implementada.
      </p>
    </div>
  );
}

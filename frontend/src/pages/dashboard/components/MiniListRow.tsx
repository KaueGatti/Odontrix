interface MiniListRowProps {
  name: string;
  count: number;
}

export function MiniListRow({ name, count }: MiniListRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--gray-100)] py-1.5 last:border-b-0">
      <span className="text-[13px] text-[var(--gray-700)]">{name}</span>
      <span className="rounded-full bg-primary/[0.12] px-[9px] py-[2px] text-[11px] font-bold text-primary">
        {count}
      </span>
    </div>
  );
}

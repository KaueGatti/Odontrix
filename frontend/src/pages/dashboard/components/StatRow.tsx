interface StatRowProps {
  dotColor: string;
  label: string;
  value: string;
}

export function StatRow({ dotColor, label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--gray-100)] py-1.5 last:border-b-0">
      <span className="flex items-center gap-2 text-[13px] text-[var(--gray-700)]">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
      <span className="text-[13px] font-bold text-[var(--gray-900)]">{value}</span>
    </div>
  );
}

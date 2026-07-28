import type { RankItem } from "../types";

export function RankRow({ position, name, value, barWidth, isTop }: RankItem) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--gray-100)] py-1.5 last:border-b-0">
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold ${
          isTop
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {position}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground">{name}</p>
        <div className="mt-[5px] h-[5px] overflow-hidden rounded-[3px] bg-muted">
          <div
            className="h-full rounded-[3px] transition-all"
            style={{
              width: `${barWidth}%`,
              background: isTop ? "var(--blue)" : "var(--gray-300)",
            }}
          />
        </div>
      </div>
      <span className="flex-shrink-0 whitespace-nowrap text-[12.5px] font-semibold text-[var(--gray-700)]">
        {value}
      </span>
    </div>
  );
}

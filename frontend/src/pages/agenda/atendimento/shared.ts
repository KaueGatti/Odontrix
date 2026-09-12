/**
 * Classes de estilo e helpers compartilhados entre os cards da
 * tela de atendimento (fiéis ao mockup dentist_appointment_finalization).
 */

export const CARD_CLASS =
  "rounded-[14px] border border-border bg-white p-5 shadow-[var(--shadow-card)]";

export const SEC_LABEL_CLASS =
  "mb-3.5 flex items-center justify-between border-b-[1.5px] border-[var(--gray-100)] pb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--gray-500)]";

export const FIELD_LABEL_CLASS = "text-[12.5px] font-medium text-muted-foreground";

export const TEXTAREA_CLASS =
  "min-h-[64px] w-full resize-y rounded-[10px] border border-input bg-muted/40 px-3 py-2 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/15";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

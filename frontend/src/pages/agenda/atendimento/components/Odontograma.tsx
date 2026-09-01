import { cn } from "@/lib/utils";

/**
 * Odontograma gráfico em notação FDI (32 dentes), fiel ao mockup:
 * quadrantes separados por um vão central, dentes desenhados em SVG
 * (coroa + raiz) e inferiores espelhados verticalmente.
 */

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

interface OdontogramaProps {
  selecionados: number[];
  onToggle: (dente: number) => void;
}

function Tooth({
  num,
  selected,
  lower,
  onToggle,
}: {
  num: number;
  selected: boolean;
  lower: boolean;
  onToggle: (n: number) => void;
}) {
  const rootCls = selected
    ? "fill-[#c8d7fb] stroke-[#3d64c9]"
    : "fill-[#eceef2] stroke-[#c9cdd6]";
  const crownCls = selected
    ? "fill-[#4F7EF7] stroke-[#3d64c9]"
    : "fill-[#f5f6f9] stroke-[#aab0bd]";
  const detailCls = selected ? "fill-white/85" : "fill-[#aab0bd]/55";

  return (
    <button
      type="button"
      onClick={() => onToggle(num)}
      title={`Dente ${num}`}
      aria-pressed={selected}
      className={cn(
        "flex w-[25px] flex-shrink-0 cursor-pointer select-none flex-col items-center",
        "[&:hover_.t-c]:stroke-[#4F7EF7]",
        lower && "flex-col-reverse"
      )}
    >
      <svg
        viewBox="0 0 20 28"
        className="block h-7 w-5 overflow-visible"
        aria-hidden="true"
      >
        <path
          className={cn("transition-colors", rootCls)}
          strokeWidth={1}
          d="M4 11 L4 22 C4 24.6 5.6 26.6 7.6 26.6 C9.4 26.6 9.7 24 10 21.4 C10.3 24 10.6 26.6 12.4 26.6 C14.4 26.6 16 24.6 16 22 L16 11 Z"
        />
        <path
          className={cn("t-c transition-colors", crownCls)}
          strokeWidth={1.1}
          d="M4.2 11.5 C2.8 11.5 2.2 9.8 2.8 7.6 C3.4 5 4.6 2.6 6.6 1.6 C8.2 0.9 11.8 0.9 13.4 1.6 C15.4 2.6 16.6 5 17.2 7.6 C17.8 9.8 17.2 11.5 15.8 11.5 Z"
        />
        <ellipse className={detailCls} cx="10" cy="6" rx="3.2" ry="1.7" />
      </svg>
      <span
        className={cn(
          "text-[9px] leading-none",
          lower ? "mb-0.5 mt-0" : "mt-1",
          selected ? "font-bold text-primary" : "text-muted-foreground"
        )}
      >
        {num}
      </span>
    </button>
  );
}

export function Odontograma({ selecionados, onToggle }: OdontogramaProps) {
  const textoSelecionados =
    selecionados.length === 0
      ? "Nenhum dente selecionado"
      : `Dentes: ${selecionados.join(", ")}`;

  return (
    <div className="inline-block rounded-[10px] border-[1.5px] border-border bg-white px-4 pb-3 pt-3.5">
      <div className="mb-1 flex text-[9px] font-semibold tracking-[0.03em] text-muted-foreground">
        <span className="flex-1 text-center">Superior direito</span>
        <span className="w-2.5" />
        <span className="flex-1 text-center">Superior esquerdo</span>
      </div>

      <div className="flex items-end gap-px">
        {UPPER_RIGHT.map((num) => (
          <Tooth
            key={num}
            num={num}
            selected={selecionados.includes(num)}
            lower={false}
            onToggle={onToggle}
          />
        ))}
        <span className="w-2.5 flex-shrink-0" />
        {UPPER_LEFT.map((num) => (
          <Tooth
            key={num}
            num={num}
            selected={selecionados.includes(num)}
            lower={false}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="mt-0.5 flex items-start gap-px">
        {LOWER_RIGHT.map((num) => (
          <Tooth
            key={num}
            num={num}
            selected={selecionados.includes(num)}
            lower={true}
            onToggle={onToggle}
          />
        ))}
        <span className="w-2.5 flex-shrink-0" />
        {LOWER_LEFT.map((num) => (
          <Tooth
            key={num}
            num={num}
            selected={selecionados.includes(num)}
            lower={true}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="mt-1 flex text-[9px] font-semibold tracking-[0.03em] text-muted-foreground">
        <span className="flex-1 text-center">Inferior direito</span>
        <span className="w-2.5" />
        <span className="flex-1 text-center">Inferior esquerdo</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5 border-t border-dashed border-border pt-2.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-[3px] border border-[#aab0bd] bg-[#f5f6f9]" />
          Não selecionado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-[3px] border border-[#3d64c9] bg-[#4F7EF7]" />
          Selecionado
        </span>
        <span className="ml-auto text-[11.5px] font-medium text-[var(--gray-900)]">
          {textoSelecionados}
        </span>
      </div>
    </div>
  );
}

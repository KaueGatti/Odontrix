import { cn } from "@/lib/utils";
import { TOOTH_ARTWORK } from "./toothArtwork";

/**
 * Odontograma gráfico em notação FDI (32 dentes). Cada dente usa a arte
 * vetorial AUTO-GERADA a partir de public/fdi-*.png (scripts/tooth-svg/
 * trace.mjs, com verificação de IoU contra os pixels), com contorno
 * anatômico próprio por tipo de dente: arcada superior com a coroa voltada
 * para baixo e inferior para cima (convenção de prontuário odontológico),
 * quadrantes separados por um vão central.
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
  const art = TOOTH_ARTWORK[num];
  const silCls = selected ? "fill-[#4F7EF7]" : "fill-[#f5f6f9]";
  const shadeCls = selected ? "fill-white/80" : "fill-[#aab0bd]/45";
  const inkCls = selected ? "fill-[#3d64c9]" : "fill-[#aab0bd]";

  return (
    <button
      type="button"
      onClick={() => onToggle(num)}
      title={`Dente ${num}`}
      aria-pressed={selected}
      className={cn(
        "flex w-[25px] flex-shrink-0 cursor-pointer select-none flex-col items-center",
        "[&:hover_.t-c]:fill-[#4F7EF7]",
        lower && "flex-col-reverse"
      )}
    >
      <svg
        viewBox={art.viewBox}
        className="block h-7 w-5 overflow-visible"
        aria-hidden="true"
      >
        <path
          className={cn("transition-colors", silCls)}
          fillRule="evenodd"
          d={art.silhouette}
        />
        {art.shades.map((d, i) => (
          <path
            key={i}
            className={cn("transition-colors", shadeCls)}
            fillRule="evenodd"
            d={d}
          />
        ))}
        <path
          className={cn("t-c transition-colors", inkCls)}
          fillRule="evenodd"
          d={art.outline}
        />
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
        <span className="w-[220px] text-center">Superior direito</span>
        <span className="w-2.5" />
        <span className="w-[185px] text-center">Superior esquerdo</span>
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
        <span className="w-[220px] text-center">Inferior direito</span>
        <span className="w-2.5" />
        <span className="w-[185px] text-center">Inferior esquerdo</span>
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

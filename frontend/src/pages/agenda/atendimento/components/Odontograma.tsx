import { useState } from "react";
import { cn } from "@/lib/utils";
import { TOOTH_ARTWORK } from "./toothArtwork";
import { TOOTH_FACES, toothName } from "./toothFaces";
import type { ToothFace } from "../types";

/**
 * Odontograma gráfico em notação FDI (32 dentes). Cada dente usa a arte
 * vetorial AUTO-GERADA a partir de public/fdi-*.png (scripts/tooth-svg/
 * trace.mjs, com verificação de IoU contra os pixels), com contorno
 * anatômico próprio por tipo de dente: arcada superior com a coroa voltada
 * para baixo e inferior para cima (convenção de prontuário odontológico),
 * números fora das arcadas (acima na superior, abaixo na inferior) e
 * quadrantes separados por um vão central.
 *
 * Seleção por face (opcional, via props `faces` + `onToggleFace`): o 1º
 * clique num dente o seleciona e foca o painel lateral; clicar de novo num
 * dente já selecionado apenas o foca (para marcar faces M/D/O·I/V/L·P no
 * painel); clicar no dente focado o desmarca. Sem faces marcadas, o
 * procedimento considera o dente inteiro.
 *
 * Escala geral: `zoom: 1.15` na raiz (+15% sobre o tamanho base — dentes,
 * painel, tipografia e espaçamentos crescem juntos; `zoom`, ao contrário de
 * `transform: scale`, também amplia a caixa de layout, preservando o fluxo
 * dos contêineres pais).
 */

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

interface OdontogramaProps {
  selecionados: number[];
  onToggle: (dente: number) => void;
  /** Faces marcadas por dente (chave FDI). Habilita a seleção por face. */
  faces?: Record<number, ToothFace[]>;
  /** Alterna uma face de um dente selecionado. */
  onToggleFace?: (dente: number, face: ToothFace) => void;
}

function Tooth({
  num,
  selected,
  lower,
  focused,
  onToggle,
}: {
  num: number;
  selected: boolean;
  lower: boolean;
  focused: boolean;
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
        "flex w-6 flex-shrink-0 cursor-pointer select-none flex-col items-center rounded-[6px]",
        "[&:hover_.t-c]:fill-[#4F7EF7]",
        !lower && "flex-col-reverse",
        focused && "bg-primary/5"
      )}
    >
      <svg
        viewBox={art.viewBox}
        className="block h-[2.1rem] w-6 overflow-visible"
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
          lower ? "mt-1" : "mb-1",
          selected ? "font-bold text-primary" : "text-muted-foreground"
        )}
      >
        {num}
      </span>
    </button>
  );
}

/** Painel de foco: dente selecionado ampliado + seleção das faces canônicas. */
function FacePanel({
  num,
  faces,
  onToggleFace,
  onRemove,
}: {
  num: number;
  faces: ToothFace[];
  onToggleFace: (n: number, f: ToothFace) => void;
  onRemove: (n: number) => void;
}) {
  const art = TOOTH_ARTWORK[num];
  return (
    <div className="flex w-[220px] flex-col rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] px-4 pb-3 pt-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold text-[var(--gray-900)]">
          Dente {num}
        </span>
        <button
          type="button"
          onClick={() => onRemove(num)}
          title="Remover dente da seleção"
          className="cursor-pointer text-[10px] font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          Remover
        </button>
      </div>
      <div className="mt-0.5 text-[10.5px] text-muted-foreground">
        {toothName(num)}
      </div>

      <div className="mt-2 flex justify-center">
        <svg
          viewBox={art.viewBox}
          className="block h-20 w-14 overflow-visible"
          aria-hidden="true"
        >
          <path className="fill-[#4F7EF7]" fillRule="evenodd" d={art.silhouette} />
          {art.shades.map((d, i) => (
            <path key={i} className="fill-white/80" fillRule="evenodd" d={d} />
          ))}
          <path className="fill-[#3d64c9]" fillRule="evenodd" d={art.outline} />
        </svg>
      </div>

      <div className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--gray-500)]">
        Faces do dente
      </div>
      <div className="mt-1.5 mb-2 flex flex-wrap gap-1">
        {TOOTH_FACES.map(({ key, short, label }) => {
          const on = faces.includes(key);
          return (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={on}
              onClick={() => onToggleFace(num, key)}
              className={cn(
                "h-6 min-w-[32px] cursor-pointer rounded-full border px-1 text-[10.5px] font-semibold" +
                  " transition-colors",
                on
                  ? "border-[#3d64c9] bg-primary text-white"
                  : "border-border bg-white text-[var(--gray-700)] hover:border-primary hover:text-primary"
              )}
            >
              {short}
            </button>
          );
        })}
      </div>
      <p className="mt-auto text-[10px] leading-snug text-muted-foreground">
        {faces.length === 0
          ? "Nenhuma face marcada — o procedimento considera o dente inteiro."
          : `Faces marcadas: ${faces.join(" · ")}`}
      </p>
    </div>
  );
}

export function Odontograma({
  selecionados,
  onToggle,
  faces = {},
  onToggleFace,
}: OdontogramaProps) {
  const [focused, setFocused] = useState<number | null>(null);
  const facesEnabled = onToggleFace !== undefined;
  const activeFocus =
    focused !== null && selecionados.includes(focused) ? focused : null;

  function handleClick(num: number) {
    if (!facesEnabled) {
      onToggle(num);
      return;
    }
    if (!selecionados.includes(num)) {
      onToggle(num);
      setFocused(num);
    } else if (focused !== num) {
      setFocused(num);
    } else {
      onToggle(num);
      setFocused(null);
    }
  }

  const textoSelecionados =
    selecionados.length === 0
      ? "Nenhum dente selecionado"
      : `Dentes: ${selecionados
          .map((n) => {
            const fs = faces[n];
            return fs && fs.length > 0 ? `${n} (${fs.join("")})` : `${n}`;
          })
          .join(", ")}`;

  return (
    <div className="inline-flex flex-wrap items-stretch gap-3 [zoom:1.15]">
      <div className="flex flex-col rounded-[10px] border-[1.5px] border-border bg-white px-4 pb-3 pt-3.5">
        <div className="mb-1.5 flex text-[9px] font-semibold tracking-[0.03em] text-muted-foreground">
          <span className="w-[199px] text-center">Superior direito</span>
          <span className="w-2.5" />
          <span className="w-[199px] text-center">Superior esquerdo</span>
        </div>

        <div className="flex items-end">
          {UPPER_RIGHT.map((num) => (
            <Tooth
              key={num}
              num={num}
              selected={selecionados.includes(num)}
              lower={false}
              focused={activeFocus === num}
              onToggle={handleClick}
            />
          ))}
          <span className="w-2.5 flex-shrink-0" />
          {UPPER_LEFT.map((num) => (
            <Tooth
              key={num}
              num={num}
              selected={selecionados.includes(num)}
              lower={false}
              focused={activeFocus === num}
              onToggle={handleClick}
            />
          ))}
        </div>

        <div className="mt-2.5 flex items-start">
          {LOWER_RIGHT.map((num) => (
            <Tooth
              key={num}
              num={num}
              selected={selecionados.includes(num)}
              lower={true}
              focused={activeFocus === num}
              onToggle={handleClick}
            />
          ))}
          <span className="w-2.5 flex-shrink-0" />
          {LOWER_LEFT.map((num) => (
            <Tooth
              key={num}
              num={num}
              selected={selecionados.includes(num)}
              lower={true}
              focused={activeFocus === num}
              onToggle={handleClick}
            />
          ))}
        </div>

        <div className="mb-2.5 mt-1.5 flex text-[9px] font-semibold tracking-[0.03em] text-muted-foreground">
          <span className="w-[199px] text-center">Inferior direito</span>
          <span className="w-2.5" />
          <span className="w-[199px] text-center">Inferior esquerdo</span>
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-dashed border-border pt-2.5 text-[10px] text-muted-foreground">
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

      {onToggleFace && activeFocus !== null && (
        <FacePanel
          num={activeFocus}
          faces={faces[activeFocus] ?? []}
          onToggleFace={onToggleFace}
          onRemove={(n) => {
            onToggle(n);
            setFocused(null);
          }}
        />
      )}
    </div>
  );
}

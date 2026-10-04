import { useEffect, useState } from "react";

const START_MIN = 8 * 60; // 08:00
const END_MIN = 19 * 60; // 19:00
const GUTTER_WIDTH = 56; // coluna de rótulos de horário

interface NowIndicatorProps {
  hourHeight: number;
  /** A coluna (visão Dia) ou a semana (visão Semana) exibida inclui hoje? */
  visible: boolean;
}

/**
 * Marcador "AGORA": linha âmbar na posição do horário atual + pill no canto
 * direito. Atualiza a cada 30s; só aparece quando hoje está visível e dentro
 * do horário da clínica.
 */
export function NowIndicator({ hourHeight, visible }: NowIndicatorProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < START_MIN || minutes >= END_MIN) return null;

  const top = ((minutes - START_MIN) / 60) * hourHeight;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ top: `${top}px`, left: GUTTER_WIDTH, right: 0 }}
    >
      <div className="h-[2px] w-full rounded-full bg-[#F59E0B]/60" />
      <span className="absolute -top-[8px] right-0 rounded-[4px] border border-[#F59E0B] bg-white px-[4px] py-[2px] text-[8px] font-bold leading-none tracking-wider text-[#B45309]">
        AGORA
      </span>
    </div>
  );
}
import type { Appointment } from "@/types/appointment";

export interface OverlapInfo {
  /** Faixa (0-based) do card na cascata. Cards que se cruzam no tempo nunca compartilham a faixa. */
  overlapIndex: number;
  /** Nº de faixas do cluster — define o recuo horizontal da cascata. */
  overlapCount: number;
  /** Ordem cronológica no cluster (0 = mais antiga) — define o empilhamento (mais recente no topo). */
  stackOrder: number;
  /** Nº de consultas do cluster — usado no badge «×N» de conflito. */
  conflictCount: number;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Calcula o layout em cascata para as consultas de UMA coluna (mesmo dentista na
 * visão Dia, mesmo dia na visão Semana).
 *
 * Lane-packing: cada consulta ocupa a primeira faixa livre — aquela cujo último
 * agendamento terminou até o início desta (faixa nova se nenhuma estiver livre).
 * Assim duas consultas que se cruzam no tempo nunca caem na mesma faixa, mesmo
 * quando uma faixa anterior é liberada no meio do cluster (ex.: A 08:00–09:00,
 * B 08:30–09:30, C 09:00–10:30 → C reusa a faixa de A, não a de B).
 *
 * Consultas encadeadas formam um cluster e compartilham o mesmo `overlapCount`
 * (nº de faixas = pico de simultâneas) e `conflictCount` (tamanho do cluster).
 */
export function computeOverlapLayout(
  appointments: Appointment[]
): Map<string, OverlapInfo> {
  const result = new Map<string, OverlapInfo>();
  const sorted = [...appointments].sort((a, b) => {
    const delta = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return delta !== 0 ? delta : timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
  });

  /** laneEnds[i] = fim (em minutos) do último agendamento alocado na faixa i. */
  let laneEnds: number[] = [];
  let cluster: string[] = [];

  const flushCluster = () => {
    const lanes = Math.max(laneEnds.length, 1);
    for (const id of cluster) {
      const info = result.get(id);
      if (info) {
        result.set(id, {
          ...info,
          overlapCount: lanes,
          conflictCount: cluster.length,
        });
      }
    }
    cluster = [];
    laneEnds = [];
  };

  for (const appt of sorted) {
    const start = timeToMinutes(appt.startTime);

    // Nenhuma faixa ainda em uso → o cluster terminou e o próximo começa.
    if (laneEnds.length > 0 && laneEnds.every((end) => end <= start)) {
      flushCluster();
    }

    // Primeira faixa livre; se todas estiverem em uso, abre uma nova.
    let laneIndex = laneEnds.findIndex((end) => end <= start);
    if (laneIndex === -1) laneIndex = laneEnds.length;

    result.set(appt.id, {
      overlapIndex: laneIndex,
      overlapCount: 1,
      stackOrder: cluster.length,
      conflictCount: 1,
    });
    laneEnds[laneIndex] = timeToMinutes(appt.endTime);
    cluster.push(appt.id);
  }
  if (cluster.length > 0) flushCluster();

  return result;
}

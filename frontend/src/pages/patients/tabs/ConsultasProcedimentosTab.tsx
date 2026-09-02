import { Eye } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/masks";

interface ProcedureRecord {
  id: string;
  date: string;
  dentistName: string;
  appointmentType: string;
  procedures: string;
  teeth: string[];
  diagnosis: string;
  value: number;
}

const MOCK_PROCEDURES: ProcedureRecord[] = [
  { id: "1", date: "10/02/2026", dentistName: "Dra. Camila Freitas", appointmentType: "Consulta", procedures: "Restauração, Profilaxia", teeth: ["36", "46"], diagnosis: "Cárie profunda", value: 350 },
  { id: "2", date: "21/11/2025", dentistName: "Dr. Marcos Silva", appointmentType: "Procedimento", procedures: "Canal", teeth: ["36"], diagnosis: "Necrose pulpar", value: 750 },
  { id: "3", date: "03/08/2025", dentistName: "Dr. Marcos Silva", appointmentType: "Avaliação", procedures: "Avaliação, Radiografia", teeth: [], diagnosis: "Avaliação inicial", value: 120 },
];

function formatCurrency(value: number) {
  return formatMoney(value);
}

export function ConsultasProcedimentosTab() {
  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <Card>
        <div className="border-b border-border px-6 py-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Consultas realizadas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Data</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Dentista</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Tipo</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Procedimentos</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Dentes</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Diagnóstico</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Valor</th>
                <th className="px-6 pb-3 pt-4 text-right text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {MOCK_PROCEDURES.map((rec) => (
                <tr key={rec.id} className="border-b border-border/50 last:border-b-0">
                  <td className="px-6 py-3 font-semibold text-foreground">{rec.date}</td>
                  <td className="px-6 py-3 text-muted-foreground">{rec.dentistName}</td>
                  <td className="px-6 py-3 text-foreground">{rec.appointmentType}</td>
                  <td className="px-6 py-3 text-foreground">{rec.procedures}</td>
                  <td className="px-6 py-3">
                    {rec.teeth.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rec.teeth.map((t) => (
                          <span
                            key={t}
                            className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{rec.diagnosis}</td>
                  <td className="px-6 py-3 font-medium text-foreground">
                    {formatCurrency(rec.value)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {MOCK_PROCEDURES.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                    Nenhuma consulta registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plano de tratamento em andamento
      <Card>
        <div className="border-b border-border px-6 py-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Plano de tratamento em andamento
          </p>
        </div>
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Etapas concluídas</span>
            <span className="text-[12px] font-semibold text-foreground">2 de 4</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Próxima consulta recomendada: <strong>10/08/2026</strong> — retorno para
              avaliação do canal do dente 36
            </span>
          </div>
        </div>
      </Card>
      */}
    </div>
  );
}

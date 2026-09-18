/**
 * Tab "Plano e Ficha" do paciente — item 6.
 *
 * Duas seções (layout validado no mockup `patient_plano_ficha_mockup.html`):
 *  - **Orçamento** — o orçamento aprovado do paciente com seus itens;
 *    itens pendentes podem ser executados ("baixa") direto daqui.
 *  - **Procedimentos Realizados** — histórico do paciente (consultas,
 *    execuções de orçamento e atendimentos avulsos), com "+" para
 *    registrar um atendimento avulso.
 *
 * Dados mock em runtime: `@/pages/patients/plano-ficha-mock-data`.
 */
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { formatMoney } from "@/lib/masks";
import { MOCK_DENTISTS } from "@/pages/agenda/mock-data";
import {
  CATALOGO_PROCEDIMENTOS,
  getQuotesByPatient,
  getRealizadosByPatient,
  hoje,
  registerAvulso,
  registerBaixa,
  type QuoteProcedureItem,
  type RealizadoRecord,
} from "../plano-ficha-mock-data";

/** TODO: substituir pelo paciente vindo da API (useParams) — mock único. */
const PATIENT_ID = "1";

/** Dentista padrão da baixa/avulso (mock — virá do usuário autenticado). */
const DENTISTA_PADRAO = "Dr. Marcos Silva";

const DENTISTAS = MOCK_DENTISTS.filter((d) => d.isActive).map((d) => d.name);

function hojeIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function PlanoFichaTab() {
  const quotes = useMemo(() => getQuotesByPatient(PATIENT_ID), []);
  const orcamento = useMemo(
    () => quotes.find((q) => q.status === "approved") ?? null,
    [quotes],
  );

  const [itens, setItens] = useState<QuoteProcedureItem[]>(() =>
    orcamento ? orcamento.items.map((i) => ({ ...i })) : [],
  );
  const [realizados, setRealizados] = useState<RealizadoRecord[]>(() =>
    getRealizadosByPatient(PATIENT_ID).map((r) => ({ ...r, teeth: [...r.teeth] })),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [procNome, setProcNome] = useState("");
  const [procDente, setProcDente] = useState("");
  const [procData, setProcData] = useState(hojeIso());
  const [procValorCents, setProcValorCents] = useState<number | null>(null);
  const [procDentista, setProcDentista] = useState(DENTISTA_PADRAO);

  const feitos = itens.filter((i) => i.realized).length;
  const pct = itens.length ? Math.round((feitos / itens.length) * 100) : 0;
  const avulsoValido = procNome.trim() !== "" && (procValorCents ?? 0) > 0;

  function handleExecutar(item: QuoteProcedureItem) {
    const registro = registerBaixa(PATIENT_ID, item, DENTISTA_PADRAO);
    setItens((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, realized: true, realizedAt: registro.date, realizedBy: registro.id } : i,
      ),
    );
    setRealizados((prev) => [{ ...registro, teeth: [...registro.teeth] }, ...prev]);
  }

  function handleAddAvulso() {
    if (!avulsoValido) return;
    const registro = registerAvulso(PATIENT_ID, {
      procedureName: procNome.trim(),
      teeth: procDente.trim() ? [Number(procDente.trim())] : [],
      date: procData || hoje(),
      dentistName: procDentista,
      value: (procValorCents ?? 0) / 100,
    });
    setRealizados((prev) => [{ ...registro, teeth: [...registro.teeth] }, ...prev]);
    setProcNome("");
    setProcDente("");
    setProcData(hojeIso());
    setProcValorCents(null);
    setProcDentista(DENTISTA_PADRAO);
    setAddOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {/* ===== Card: Orçamento aprovado ===== */}
      {orcamento ? (
      <Card>
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                Orçamento
              </p>
              <Badge variant="success">Aprovado</Badge>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              #{orcamento?.id} · {orcamento?.description} · válido até {orcamento?.validUntil}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Total do orçamento</p>
            <p className="text-[15px] font-bold text-foreground">
              {formatMoney(orcamento?.totalValue ?? 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 pb-1 pt-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#22C55E] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-[11.5px] text-muted-foreground">
            {feitos} de {itens.length} concluídos
          </span>
        </div>

        {itens.length === 0 ? (
          <p className="px-6 py-6 text-center text-[13px] text-muted-foreground">
            Nenhum item neste orçamento.
          </p>
        ) : (
          <div>
            {itens.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 border-b border-border/50 px-6 py-3 last:border-b-0 ${item.realized ? "bg-[#22C55E]/[0.04]" : ""}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">{item.procedureName}</p>
                    {item.toothFdi !== null && (
                      <span className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-bold text-primary">
                        {item.toothFdi}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {item.realized
                      ? `Executado em ${item.realizedAt}`
                      : "Pendente — agende ou execute na consulta"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12.5px] font-semibold text-[var(--gray-700)]">
                    {formatMoney(item.finalPrice)}
                  </span>
                  {item.realized ? (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#16A34A]">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#22C55E]" />
                      Realizado
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="h-[30px] gap-1.5 rounded-[10px] bg-[#22C55E]/15 px-4 text-[12px] font-semibold text-[#16A34A] shadow-none hover:bg-[#22C55E]/25"
                      onClick={() => handleExecutar(item)}
                    >
                      Executar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      ) : (
        <Card>
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Orçamento
            </p>
          </div>
          <p className="px-6 py-8 text-center text-[13px] text-muted-foreground">
            Nenhum orçamento aprovado para este paciente.
          </p>
        </Card>
      )}

      {/* ===== Card: Procedimentos Realizados ===== */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Procedimentos Realizados
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Executados nas consultas e atendimentos avulsos
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAddOpen((v) => !v)}
            title="Registrar atendimento avulso"
          >
            {addOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {addOpen ? "Fechar" : "Registrar avulso"}
          </Button>
        </div>

        {addOpen && (
          <div className="grid grid-cols-[2fr_90px_130px_130px_1fr_auto] items-end gap-3 border-b border-border bg-[var(--gray-50)] px-6 py-4">
            <div className="flex flex-col gap-[6px]">
              <Label className="text-[12.5px]">Procedimento</Label>
              <Input
                list="catalogo-procedimentos"
                placeholder="Ex.: Extração simples"
                className="h-10 border-[1.5px] bg-white px-3 text-[13px]"
                value={procNome}
                onChange={(e) => setProcNome(e.target.value)}
              />
              <datalist id="catalogo-procedimentos">
                {CATALOGO_PROCEDIMENTOS.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className="text-[12.5px]">Dente (FDI)</Label>
              <Input
                inputMode="numeric"
                placeholder="36"
                className="h-10 border-[1.5px] bg-white px-3 text-[13px]"
                value={procDente}
                onChange={(e) => setProcDente(e.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className="text-[12.5px]">Data</Label>
              <Input
                type="date"
                className="h-10 border-[1.5px] bg-white px-3 text-[13px]"
                value={procData}
                onChange={(e) => setProcData(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className="text-[12.5px]">Valor</Label>
              <MoneyInput
                id="avulso-valor"
                value={procValorCents}
                onCentsChange={setProcValorCents}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className="text-[12.5px]">Dentista</Label>
              <Select
                value={procDentista}
                onChange={(e) => setProcDentista(e.target.value)}
                className="h-10 text-[13px]"
              >
                {DENTISTAS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!avulsoValido} onClick={handleAddAvulso}>
                Adicionar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {realizados.length === 0 ? (
          <p className="px-6 py-8 text-center text-[13px] text-muted-foreground">
            Nenhum procedimento realizado.
          </p>
        ) : (
          <div>
            {realizados.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-3 transition-shadow last:border-b-0 hover:shadow-[inset_0_0_0_1.5px_var(--blue)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">{r.procedureName}</p>
                    {r.teeth.map((t) => (
                      <span
                        key={t}
                        className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-bold text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {r.date} · {r.dentistName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.origin === "orcamento" ? "info" : "neutral"}>
                    {r.origin === "orcamento" ? "Orçamento" : "Avulso"}
                  </Badge>
                  <span className="text-[12.5px] font-semibold text-[var(--gray-700)]">
                    {formatMoney(r.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
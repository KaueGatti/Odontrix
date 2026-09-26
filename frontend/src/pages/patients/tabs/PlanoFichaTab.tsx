/**
 * Tab "Plano e Ficha" do paciente — item 6.
 *
 * Duas seções (layout validado no mockup `patient_plano_ficha_mockup.html`):
 *  - **Orçamento** — o orçamento aprovado do paciente com seus itens;
 *    itens pendentes podem ser executados ("baixa") direto daqui, com
 *    data de execução obrigatória (editor inline na linha do item).
 *    O crédito do paciente (parcelas pagas − procedimentos realizados)
 *    é exibido no header do card e valida a baixa ao clicar em Executar.
 *  - **Procedimentos Realizados** — histórico do paciente (consultas,
 *    execuções de orçamento e atendimentos avulsos), com "+" para
 *    registrar um atendimento avulso (sem seleção de dentista — o
 *    dentista virá do usuário autenticado).
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
import { MoneyInput } from "@/components/ui/money-input";
import { formatMoney } from "@/lib/masks";
import { Odontograma } from "@/pages/agenda/atendimento/components/Odontograma";
import type { ToothFace } from "@/pages/agenda/atendimento/types";
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

function hojeIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** ISO (YYYY-MM-DD, valor do <Input type="date">) → DD/MM/AAAA (exibição). */
function isoToBr(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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
  const [procDentes, setProcDentes] = useState<number[]>([]);
  const [procFaces, setProcFaces] = useState<Record<number, ToothFace[]>>({});
  const [procData, setProcData] = useState(hojeIso());
  const [procValorCents, setProcValorCents] = useState<number | null>(null);

  /** Editor inline de baixa: id do item sendo executado + data (ISO). */
  const [executarId, setExecutarId] = useState<string | null>(null);
  const [executarData, setExecutarData] = useState("");
  /** Alerta de crédito insuficiente ao clicar em Executar. */
  const [creditoAlerta, setCreditoAlerta] = useState<{ itemId: string; credito: number; valor: number } | null>(
    null,
  );

  const feitos = itens.filter((i) => i.realized).length;
  const pct = itens.length ? Math.round((feitos / itens.length) * 100) : 0;
  const avulsoValido = procNome.trim() !== "" && (procValorCents ?? 0) > 0;

  /** Crédito do paciente = parcelas pagas do orçamento − procedimentos realizados. */
  const gastoOrcamento = itens.filter((i) => i.realized).reduce((acc, i) => acc + i.finalPrice, 0);
  const credito = (orcamento?.paidTotal ?? 0) - gastoOrcamento;

  /** Abre o editor inline de data na linha do item — valida o crédito antes. */
  function handleExecutar(item: QuoteProcedureItem) {
    if (credito < item.finalPrice) {
      setCreditoAlerta({ itemId: item.id, credito, valor: item.finalPrice });
      return;
    }
    setCreditoAlerta(null);
    setExecutarId(item.id);
    setExecutarData(hojeIso());
  }

  function handleConfirmExecutar(item: QuoteProcedureItem) {
    if (!executarData || credito < item.finalPrice) return;
    const registro = registerBaixa(PATIENT_ID, item, DENTISTA_PADRAO, isoToBr(executarData));
    setItens((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, realized: true, realizedAt: registro.date, realizedBy: registro.id } : i,
      ),
    );
    setRealizados((prev) => [{ ...registro, teeth: [...registro.teeth] }, ...prev]);
    setExecutarId(null);
    setExecutarData("");
    setCreditoAlerta(null);
  }

  function handleCancelExecutar() {
    setExecutarId(null);
    setExecutarData("");
    setCreditoAlerta(null);
  }

  function toggleProcDente(dente: number) {
    setProcDentes((prev) =>
      prev.includes(dente) ? prev.filter((d) => d !== dente) : [...prev, dente],
    );
    // Faces só valem para dentes selecionados.
    setProcFaces((prev) => {
      if (!prev[dente]) return prev;
      const next = { ...prev };
      delete next[dente];
      return next;
    });
  }

  function toggleProcFace(dente: number, face: ToothFace) {
    setProcFaces((prev) => {
      const cur = prev[dente] ?? [];
      return {
        ...prev,
        [dente]: cur.includes(face) ? cur.filter((f) => f !== face) : [...cur, face],
      };
    });
  }

  function handleAddAvulso() {
    if (!avulsoValido) return;
    const faces = Object.fromEntries(
      Object.entries(procFaces).filter(([, fs]) => fs.length > 0),
    ) as Record<number, ToothFace[]>;
    const registro = registerAvulso(PATIENT_ID, {
      procedureName: procNome.trim(),
      teeth: procDentes,
      ...(Object.keys(faces).length > 0 ? { faces } : {}),
      date: isoToBr(procData) || hoje(),
      dentistName: DENTISTA_PADRAO,
      value: (procValorCents ?? 0) / 100,
    });
    setRealizados((prev) => [{ ...registro, teeth: [...registro.teeth] }, ...prev]);
    setProcNome("");
    setProcDentes([]);
    setProcFaces({});
    setProcData(hojeIso());
    setProcValorCents(null);
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
          <div
            className="text-right"
            title="Parcelas pagas do orçamento − procedimentos realizados"
          >
            <p className="text-[11px] text-muted-foreground">Crédito do paciente</p>
            <p
              className={`text-[15px] font-bold ${credito >= 0 ? "text-[#16A34A]" : "text-destructive"}`}
            >
              {formatMoney(credito)}
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
              <div key={item.id} className="border-b border-border/50 last:border-b-0">
                <div
                  className={`flex items-center justify-between gap-4 px-6 py-3 ${item.realized ? "bg-[#22C55E]/[0.04]" : ""}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-foreground">{item.procedureName}</p>
                      {item.teeth.map((t) => {
                        const fs = item.faces?.[t];
                        return (
                          <span
                            key={t}
                            className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-bold text-primary"
                          >
                            {t}
                            {fs && fs.length > 0 ? ` · ${fs.join("")}` : null}
                          </span>
                        );
                      })}
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
                {creditoAlerta?.itemId === item.id && (
                  <div className="border-t border-destructive/20 bg-destructive/[0.06] px-6 py-2.5">
                    <p className="text-[12px] font-medium text-destructive">
                      Crédito insuficiente — disponível {formatMoney(creditoAlerta.credito)} · procedimento{" "}
                      {formatMoney(creditoAlerta.valor)}
                    </p>
                  </div>
                )}
                {executarId === item.id && !item.realized && (
                  <div className="flex items-end justify-between gap-4 border-t border-border/50 bg-[var(--gray-50)] px-6 py-3">
                    <div className="flex flex-col gap-[6px]">
                      <Label className="text-[12.5px]">Data da execução</Label>
                      <Input
                        type="date"
                        aria-invalid={!executarData}
                        className="h-10 border-[1.5px] bg-white px-3 text-[13px]"
                        value={executarData}
                        onChange={(e) => setExecutarData(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={!executarData} onClick={() => handleConfirmExecutar(item)}>
                        Confirmar
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelExecutar}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
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
          <div className="border-b border-border bg-[var(--gray-50)] px-6 py-4">
          <div className="grid grid-cols-[2fr_130px_130px_auto] items-end gap-3">
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
            <div className="flex gap-2">
              <Button size="sm" disabled={!avulsoValido} onClick={handleAddAvulso}>
                Adicionar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-[6px]">
            <Label className="text-[12.5px]">
              Dente(s) e faces{" "}
              <span className="font-normal text-muted-foreground/70">
                — clique no dente para selecionar; de novo para marcar faces
              </span>
            </Label>
            <Odontograma
              selecionados={procDentes}
              onToggle={toggleProcDente}
              faces={procFaces}
              onToggleFace={toggleProcFace}
            />
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
                    {r.teeth.map((t) => {
                      const fs = r.faces?.[t];
                      return (
                        <span
                          key={t}
                          className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-bold text-primary"
                        >
                          {t}
                          {fs && fs.length > 0 ? ` · ${fs.join("")}` : null}
                        </span>
                      );
                    })}
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
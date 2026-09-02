import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";
import { formatMoneyFromCents } from "@/lib/masks";
import { CARD_CLASS, FIELD_LABEL_CLASS, SEC_LABEL_CLASS } from "../shared";
import type { ProcedimentoRealizado } from "../types";
import {Odontograma} from "@/pages/agenda/atendimento/components/Odontograma.tsx";

/** Catálogo de procedimentos com preço padrão (mock, igual ao mockup). */
const CATALOGO: { nome: string; precoCents: number }[] = [
  { nome: "Limpeza (Profilaxia)", precoCents: 12000 },
  { nome: "Restauração em resina", precoCents: 18000 },
  { nome: "Extração simples", precoCents: 22000 },
  { nome: "Aplicação de flúor", precoCents: 6000 },
  { nome: "Canal (Endodontia)", precoCents: 65000 },
  { nome: "Avaliação / Consulta", precoCents: 15000 },
];

const TH_CLASS =
  "border-b-[1.5px] border-[var(--gray-100)] px-2 pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--gray-500)]";
const TD_CLASS = "border-b border-[var(--gray-100)] px-2 py-2.5";

interface ProcedimentosCardProps {
  procedimentos: ProcedimentoRealizado[];
  onAdd: (p: Omit<ProcedimentoRealizado, "id">) => void;
  onRemove: (id: string) => void;
  hasError?: boolean;
}

export function ProcedimentosCard({
  procedimentos,
  onAdd,
  onRemove,
  hasError,
}: ProcedimentosCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");
  const [dentes, setDentes] = useState<number[]>([]);
  const [valorCents, setValorCents] = useState(0);
  const [descontoCents, setDescontoCents] = useState(0);

  const valorFinalCents = Math.max(0, valorCents - descontoCents);

  function toggleDente(dente: number) {
    setDentes((prev) =>
      prev.includes(dente) ? prev.filter((d) => d !== dente) : [...prev, dente]
    );
  }

  function resetPanel() {
    setNome("");
    setObs("");
    setDentes([]);
    setValorCents(0);
    setDescontoCents(0);
  }

  function handleAdd() {
    if (!nome) return;
    onAdd({
      nome,
      dentes,
      valorCents,
      descontoCents,
      valorFinalCents,
      obs: obs.trim() || undefined,
    });
    resetPanel();
    setPanelOpen(false);
  }

  return (
    <div className={cn(CARD_CLASS, hasError && "border-destructive/50")}>
      <div className={SEC_LABEL_CLASS}>
        <span>
          Procedimentos realizados{" "}
          <span className="font-normal normal-case tracking-normal text-destructive">
            *
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-[10px] text-[12px] font-semibold"
          onClick={() => setPanelOpen((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar procedimento
        </Button>
      </div>

      {hasError && (
        <p className="mb-3 text-xs text-destructive">
          Adicione ao menos um procedimento realizado.
        </p>
      )}

      {/* Painel de adição */}
      {panelOpen && (
        <div className="mb-4 rounded-[10px] border-[1.5px] border-border bg-muted p-4">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Procedimento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={nome}
                onChange={(e) => {
                  const selecionado = e.target.value;
                  setNome(selecionado);
                  const item = CATALOGO.find((c) => c.nome === selecionado);
                  if (item) setValorCents(item.precoCents);
                }}
                className="h-10 rounded-[10px] text-[13px]"
              >
                <option value="">Selecione...</option>
                {CATALOGO.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Observação do procedimento
              </Label>
              <Input
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Opcional"
                className="h-10 rounded-[10px] text-[13px]"
              />
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-[6px]">
            <Label className={FIELD_LABEL_CLASS}>
              Dente(s) envolvido(s){" "}
              <span className="font-normal text-muted-foreground/70">
                — notação FDI, opcional
              </span>
            </Label>
            <Odontograma selecionados={dentes} onToggle={toggleDente}/>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>Valor</Label>
              <MoneyInput value={valorCents} onCentsChange={setValorCents} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>Desconto</Label>
              <MoneyInput
                value={descontoCents}
                onCentsChange={setDescontoCents}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>Valor final</Label>
              <div className="flex h-10 items-center rounded-[10px] border border-input bg-muted/40 px-3 text-[13px] font-semibold text-foreground">
                {formatMoneyFromCents(valorFinalCents)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[10px] text-[12px] font-semibold"
              onClick={() => {
                resetPanel();
                setPanelOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-[10px] text-[12px] font-semibold"
              disabled={!nome}
              onClick={handleAdd}
            >
              Adicionar à lista
            </Button>
          </div>
        </div>
      )}

      {/* Tabela de procedimentos */}
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className={TH_CLASS}>Procedimento</th>
            <th className={TH_CLASS}>Dente(s)</th>
            <th className={TH_CLASS}>Valor</th>
            <th className={TH_CLASS}>Desconto</th>
            <th className={TH_CLASS}>Valor final</th>
            <th className={TH_CLASS}>Obs.</th>
            <th className={TH_CLASS} />
          </tr>
        </thead>
        <tbody>
          {procedimentos.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-2 py-4 text-center text-[12px] italic text-muted-foreground"
              >
                Nenhum procedimento adicionado — clique em “Adicionar
                procedimento”.
              </td>
            </tr>
          ) : (
            procedimentos.map((p) => (
              <tr key={p.id}>
                <td className={cn(TD_CLASS, "font-semibold text-[var(--gray-900)]")}>
                  {p.nome}
                </td>
                <td className={TD_CLASS}>
                  {p.dentes.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    p.dentes.map((d) => (
                      <span
                        key={d}
                        className="mr-0.5 inline-block rounded-[10px] border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                      >
                        {d}
                      </span>
                    ))
                  )}
                </td>
                <td className={TD_CLASS}>
                  {formatMoneyFromCents(p.valorCents)}
                </td>
                <td className={TD_CLASS}>
                  {formatMoneyFromCents(p.descontoCents)}
                </td>
                <td className={cn(TD_CLASS, "font-semibold text-[var(--gray-900)]")}>
                  {formatMoneyFromCents(p.valorFinalCents)}
                </td>
                <td className={cn(TD_CLASS, "text-[var(--gray-500)]")}>
                  {p.obs || "—"}
                </td>
                <td className={cn(TD_CLASS, "text-right")}>
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    title="Remover procedimento"
                    className="inline-flex text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

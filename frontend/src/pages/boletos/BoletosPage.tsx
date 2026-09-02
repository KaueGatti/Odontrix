import { useMemo, useState } from "react";
import { AlertTriangle, CircleCheck, Clock, Eye, Receipt, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { BoletoStatusBadge } from "./components/BoletoStatusBadge";
import { DetalheBoletoDialog } from "./components/DetalheBoletoDialog";
import { RegistrarPagamentoBoletoDialog } from "./components/RegistrarPagamentoBoletoDialog";
import { AdiarVencimentoDialog } from "./components/AdiarVencimentoDialog";
import { CancelarBoletoDialog } from "./components/CancelarBoletoDialog";
import { MOCK_BOLETOS } from "./mock-data";
import { centsToNumber, formatMoney } from "@/lib/masks";
import type { Boleto, BoletoStatus } from "./types";

/** Converte "DD/MM/AAAA" em número comparável (AAAAMMDD). */
function brDateToNumber(br: string): number {
  const [d, m, y] = br.split("/").map(Number);
  if (!d || !m || !y) return 0;
  return y * 10000 + m * 100 + d;
}

type StatusTab = "all" | BoletoStatus;

const TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "issued", label: "Emitidos" },
  { value: "registered", label: "Registrados" },
  { value: "paid", label: "Pagos" },
  { value: "overdue", label: "Vencidos" },
  { value: "cancelled", label: "Cancelados" },
];

export default function BoletosPage() {
  const [boletos, setBoletos] = useState<Boleto[]>(MOCK_BOLETOS);
  const [tab, setTab] = useState<StatusTab>("all");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [buscaNumero, setBuscaNumero] = useState("");
  const [vencimentoDe, setVencimentoDe] = useState("");
  const [vencimentoAte, setVencimentoAte] = useState("");

  const [detalheOpen, setDetalheOpen] = useState(false);
  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const [adiarOpen, setAdiarOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<Boleto | null>(null);

  const total = boletos.length;
  const registrados = boletos.filter((b) => b.status === "registered").length;
  const pagos = boletos.filter((b) => b.status === "paid").length;
  const vencidos = boletos.filter((b) => b.status === "overdue").length;
  const valorVencidoCents = boletos
    .filter((b) => b.status === "overdue")
    .reduce((acc, b) => acc + b.valorCents, 0);
  const cancelados = boletos.filter((b) => b.status === "cancelled").length;
  const emitidos = boletos.filter((b) => b.status === "issued").length;

  const countByStatus: Record<StatusTab, number> = {
    all: total,
    issued: emitidos,
    registered: registrados,
    paid: pagos,
    overdue: vencidos,
    cancelled: cancelados,
  };

  const filtrados = useMemo(() => {
    const de = brDateToNumber(vencimentoDe);
    const ate = brDateToNumber(vencimentoAte);
    return boletos.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (buscaPaciente.trim() && !b.paciente.toLowerCase().includes(buscaPaciente.toLowerCase().trim()))
        return false;
      if (buscaNumero.trim() && !b.nossoNumero.includes(buscaNumero.trim())) return false;
      const v = brDateToNumber(b.vencimento);
      if (de && v < de) return false;
      if (ate && v > ate) return false;
      return true;
    });
  }, [boletos, tab, buscaPaciente, buscaNumero, vencimentoDe, vencimentoAte]);

  function abrirDetalhe(b: Boleto) {
    setSelecionado(b);
    setDetalheOpen(true);
  }

  function atalho(b: Boleto, openState: (v: boolean) => void) {
    setSelecionado(b);
    setDetalheOpen(false);
    openState(true);
  }

  function confirmarPagamento(dados: { valorPagoCents: number; dataPagamento: string }) {
    if (!selecionado) return;
    setBoletos((prev) =>
      prev.map((b) =>
        b.id === selecionado.id
          ? { ...b, status: "paid" as const, pagoEm: isoToBr(dados.dataPagamento) }
          : b,
      ),
    );
    setSelecionado(null);
  }

    function confirmarAdiamento(novoVencimento: string) {
    if (!selecionado) return;
    setBoletos((prev) =>
      prev.map((b) => (b.id === selecionado.id ? { ...b, vencimento: novoVencimento } : b)),
    );
    setSelecionado(null);
  }

  function confirmarCancelamento() {
    if (!selecionado) return;
    setBoletos((prev) =>
      prev.map((b) =>
        b.id === selecionado.id ? { ...b, status: "cancelled" as const, canceladoEm: hojeBR() } : b,
      ),
    );
        setSelecionado(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* PAGE_TOP */}
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-4.5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Financeiro
          </p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Boletos</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-9 py-7">
        <div className="grid grid-cols-5 gap-[14px]">
          <KpiCard
            icon={Receipt}
            iconBg="bg-primary/[0.12]"
            iconColor="var(--blue)"
            label="Total de boletos"
            value={String(total)}
          />
          <KpiCard
            icon={Clock}
            iconBg="bg-[rgba(45,212,191,0.15)]"
            iconColor="#0d9488"
            label="Registrados / em aberto"
            value={String(registrados)}
          />
          <KpiCard
            icon={CircleCheck}
            iconBg="bg-[rgba(74,222,128,0.14)]"
            iconColor="#16a34a"
            label="Pagos"
            value={String(pagos)}
          />
          <KpiCard
            icon={AlertTriangle}
            iconBg="bg-[rgba(248,113,113,0.14)]"
            iconColor="#dc2626"
            label="Vencidos"
            value={String(vencidos)}
          />
          <KpiCard
            icon={Receipt}
            iconBg="bg-[var(--gray-100)]"
            iconColor="var(--gray-400)"
            label="Valor vencido em aberto"
            value={formatMoney(centsToNumber(valorVencidoCents))}
          />
        </div>

        <div className="mt-4">
          <Card>
            <div className="px-6 pt-5">
              <p className="mb-0.5 text-[15px] font-bold tracking-tight text-foreground">Todos os boletos</p>
              <p className="mb-4.5 text-[11.5px] text-muted-foreground">
                Emitidos via Sicredi — atualizado automaticamente por retorno bancário
              </p>
            </div>

            <div className="flex flex-wrap gap-2 px-6 pb-4">
              {TABS.map((t) => (
                <TabPill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
                  {t.label}
                  <span
                    className={`rounded-full px-[6px] py-[1px] text-[10px] font-bold ${
                      tab === t.value ? "bg-white/25 text-white" : "bg-[var(--gray-100)] text-muted-foreground"
                    }`}
                  >
                    {countByStatus[t.value]}
                  </span>
                </TabPill>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-2.5 px-6 pb-4.5">
              <div className="flex min-w-[200px] flex-1 flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Paciente</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    placeholder="Buscar por nome do paciente..."
                    className={FILTER_CLASS + " w-full pl-[30px]"}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Nosso número</label>
                <input
                  value={buscaNumero}
                  onChange={(e) => setBuscaNumero(e.target.value)}
                  placeholder="Ex: 00012345"
                  className={FILTER_CLASS + " min-w-[150px]"}
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Vencimento de</label>
                <input
                  value={vencimentoDe}
                  onChange={(e) => setVencimentoDe(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className={FILTER_CLASS + " min-w-[130px]"}
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">até</label>
                <input
                  value={vencimentoAte}
                  onChange={(e) => setVencimentoAte(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className={FILTER_CLASS + " min-w-[130px]"}
                />
              </div>
            </div>
            <div className="overflow-x-auto px-6 pb-2">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    <TH>Paciente</TH>
                    <TH>Nosso número</TH>
                    <TH>Vencimento</TH>
                    <TH>Valor</TH>
                    <TH>Status</TH>
                    <TH>Emitido em</TH>
                    <TH right>Ações</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((b) => (
                    <tr
                      key={b.id}
                      className={`border-b border-[var(--gray-100)] last:border-b-0 ${
                        b.status === "cancelled" ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-2 py-3 align-middle font-semibold text-foreground">{b.paciente}</td>
                      <td className="px-2 py-3 align-middle font-mono text-[11.5px] text-foreground">{b.nossoNumero}</td>
                      <td className="px-2 py-3 align-middle text-muted-foreground">{b.vencimento}</td>
                      <td className="px-2 py-3 align-middle text-foreground">{formatMoney(centsToNumber(b.valorCents))}</td>
                      <td className="px-2 py-3 align-middle">
                        <BoletoStatusBadge status={b.status} />
                      </td>
                      <td className="px-2 py-3 align-middle text-muted-foreground">{b.emitidoEm}</td>
                      <td className="px-2 py-3 align-middle">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => abrirDetalhe(b)}
                            title="Ver detalhes"
                            className="inline-flex rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-[12px] italic text-muted-foreground">
                        Nenhum boleto encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      <DetalheBoletoDialog
        open={detalheOpen}
        onOpenChange={setDetalheOpen}
        boleto={selecionado}
        onRegistrarPagamento={(b) => atalho(b, setPagamentoOpen)}
        onAdiarVencimento={(b) => atalho(b, setAdiarOpen)}
        onCancelar={(b) => atalho(b, setCancelarOpen)}
      />
      <RegistrarPagamentoBoletoDialog
        open={pagamentoOpen}
        onOpenChange={setPagamentoOpen}
        boleto={selecionado}
        onConfirm={confirmarPagamento}
      />
      <AdiarVencimentoDialog
        open={adiarOpen}
        onOpenChange={setAdiarOpen}
        boleto={selecionado}
        onConfirm={confirmarAdiamento}
      />
      <CancelarBoletoDialog
        open={cancelarOpen}
        onOpenChange={setCancelarOpen}
        boleto={selecionado}
        onConfirm={confirmarCancelamento}
      />
    </div>
  );
}

function isoToBr(iso: string): string {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "";
}

function hojeBR(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${now.getFullYear()}`;
}

const FILTER_CLASS =
  "h-8 appearance-none rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] bg-no-repeat px-[10px] text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]";

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-[7px] text-[12px] font-semibold transition-all ${
        active
          ? "border-primary bg-primary text-white shadow-[0_6px_16px_rgba(79,126,247,0.32)]"
          : "border-border bg-white text-muted-foreground hover:border-[var(--gray-300)] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TH({
  children,
  right = false,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
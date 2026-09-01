import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Check, Info, Play } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMockAppointmentById,
  setMockAppointmentStatus,
} from "../mock-data";
import { ProcedimentosCard } from "./components/ProcedimentosCard";
import { AnamneseCard } from "./components/AnamneseCard";
import { AnexosCard } from "./components/AnexosCard";
import {
  CARD_CLASS,
  FIELD_LABEL_CLASS,
  SEC_LABEL_CLASS,
  TEXTAREA_CLASS,
  maskDataBR,
} from "./shared";
import type {
  AnamneseData,
  AnamneseHistorico,
  AnexoItem,
  ProcedimentoRealizado,
} from "./types";

const TYPE_LABELS: Record<string, string> = {
  consulta: "Consulta de rotina",
  retorno: "Retorno",
  procedimento: "Procedimento",
  emergencia: "Emergência",
  avaliacao: "Avaliação",
  implante: "Implante",
  manutencao: "Manutenção",
};

function currentHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function todayBR(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ANAMNESE_INICIAL: AnamneseData = {
  alergias: "Penicilina",
  medicamentos: "Nenhum informado",
  doencas: "Hipertensão controlada",
};

const ANAMNESE_ANTERIOR: AnamneseHistorico = {
  data: "05/11/2023",
  anamnese: {
    alergias: "Penicilina",
    medicamentos: "Losartana 50mg",
    doencas: "Hipertensão",
  },
};

const ANEXOS_INICIAIS: AnexoItem[] = [
  {
    id: "anexo-1",
    nome: "radiografia_panoramica.jpg",
    tipo: "Radiografia",
    icone: "radiografia",
    tamanho: "2,4 MB",
  },
  {
    id: "anexo-2",
    nome: "foto_intraoral_dente36.jpg",
    tipo: "Foto intraoral",
    icone: "foto",
    tamanho: "1,1 MB",
  },
];

const PROCEDIMENTOS_INICIAIS: ProcedimentoRealizado[] = [
  {
    id: "proc-1",
    nome: "Restauração em resina",
    dentes: [36],
    valorCents: 18000,
    descontoCents: 0,
    valorFinalCents: 18000,
  },
  {
    id: "proc-2",
    nome: "Aplicação de flúor",
    dentes: [],
    valorCents: 6000,
    descontoCents: 0,
    valorFinalCents: 6000,
  },
];

export default function AtendimentoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment = useMemo(() => getMockAppointmentById(id), [id]);

  const [inicioReal, setInicioReal] = useState(currentHHMM);
  const [terminoReal, setTerminoReal] = useState(currentHHMM);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoRealizado[]>(
    PROCEDIMENTOS_INICIAIS
  );
  const [queixa, setQueixa] = useState(
    "Sensibilidade ao mastigar do lado esquerdo, principalmente com alimentos frios."
  );
  const [diagnostico, setDiagnostico] = useState(
    "Cárie oclusal em dente 36, sem comprometimento pulpar aparente."
  );
  const [planoTratamento, setPlanoTratamento] = useState(
    "Acompanhar restauração em 30 dias. Avaliar necessidade de tratamento no dente 37 na próxima consulta."
  );
  const [observacoesClinicas, setObservacoesClinicas] = useState(
    "Paciente relatou ansiedade leve; procedimento realizado sem intercorrências."
  );
  const [anamnese, setAnamnese] = useState<AnamneseData>(ANAMNESE_INICIAL);
  const [anamneseAnterior, setAnamneseAnterior] =
    useState<AnamneseHistorico | null>(ANAMNESE_ANTERIOR);
  const [anamneseAtualizadaEm, setAnamneseAtualizadaEm] =
    useState("10/03/2025");
  const [retorno, setRetorno] = useState("");
  const [anexos, setAnexos] = useState<AnexoItem[]>(ANEXOS_INICIAIS);
  const [erros, setErros] = useState({
    procedimentos: false,
    queixa: false,
    diagnostico: false,
  });
  const [rascunhoMsg, setRascunhoMsg] = useState("");

  const procedRef = useRef<HTMLDivElement>(null);
  const avaliacaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rascunhoMsg) return;
    const t = setTimeout(() => setRascunhoMsg(""), 4000);
    return () => clearTimeout(t);
  }, [rascunhoMsg]);

  const duracaoRealMin = useMemo(() => {
    const [h1, m1] = inicioReal.split(":").map(Number);
    const [h2, m2] = terminoReal.split(":").map(Number);
    if ([h1, m1, h2, m2].some((n) => Number.isNaN(n))) return null;
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    return diff > 0 ? diff : null;
  }, [inicioReal, terminoReal]);

  if (!appointment) {
    return <Navigate to="/agenda" replace />;
  }

  const hasErros = erros.procedimentos || erros.queixa || erros.diagnostico;

  function handleFinalizar() {
    const novosErros = {
      procedimentos: procedimentos.length === 0,
      queixa: !queixa.trim(),
      diagnostico: !diagnostico.trim(),
    };
    setErros(novosErros);

    if (novosErros.procedimentos) {
      procedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (novosErros.queixa || novosErros.diagnostico) {
      avaliacaoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    // Persiste o status no registro compartilhado e volta para a agenda
    setMockAppointmentStatus(appointment.id, "realizada");
    navigate("/agenda");
  }

  function handleAtualizarAnamnese(nova: AnamneseData) {
    setAnamneseAnterior({ data: anamneseAtualizadaEm, anamnese });
    setAnamnese(nova);
    setAnamneseAtualizadaEm(todayBR());
  }

  function handleAddAnexos(files: File[]) {
    const novos: AnexoItem[] = files.map((f, i) => ({
      id: `anexo-${Date.now()}-${i}`,
      nome: f.name,
      tipo: "Arquivo",
      icone: "arquivo",
      tamanho: formatFileSize(f.size),
    }));
    setAnexos((prev) => [...prev, ...novos]);
  }

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="border-b border-border bg-white px-7 py-4 shadow-[var(--shadow-topbar)]">
        <button
          type="button"
          onClick={() => navigate("/agenda")}
          className="mb-2.5 flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar à agenda
        </button>

        <div className="flex items-center gap-3.5">
          <Avatar
            name={appointment.patientName}
            className="h-11 w-11 bg-[rgba(79,126,247,0.14)] text-[13px] text-primary"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] font-bold tracking-[-0.2px] text-[var(--gray-900)]">
                {appointment.patientName}
              </span>
              <Badge variant="warning">
                <Play className="h-2.5 w-2.5" />
                Em atendimento
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span>{TYPE_LABELS[appointment.type] || appointment.type}</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[var(--gray-400)]" />
              <span>
                Agendado: {format(parseISO(appointment.date), "dd/MM/yyyy")}{" "}
                {appointment.startTime}
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-[var(--gray-400)]" />
              <span>Duração estimada: {appointment.durationMin} min</span>
            </div>
          </div>

          <div className="ml-auto flex items-end gap-4">
            <div className="flex flex-col gap-[3px]">
              <label className="text-[10px] font-medium text-muted-foreground">
                Início real
              </label>
              <Input
                type="time"
                value={inicioReal}
                onChange={(e) => setInicioReal(e.target.value)}
                className="h-9 w-[88px] rounded-[10px] px-2 text-[12.5px]"
              />
            </div>
            <div className="flex flex-col gap-[3px]">
              <label className="text-[10px] font-medium text-muted-foreground">
                Término real
              </label>
              <Input
                type="time"
                value={terminoReal}
                onChange={(e) => setTerminoReal(e.target.value)}
                className="h-9 w-[88px] rounded-[10px] px-2 text-[12.5px]"
              />
            </div>
            <span className="pb-1.5 text-[12px] font-semibold text-primary">
              {duracaoRealMin !== null ? `${duracaoRealMin} min` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-auto bg-[var(--gray-100)] px-7 py-5">
        <div
          className={
            hasErros
              ? "mb-4 flex items-center gap-2 rounded-[10px] border border-destructive/30 bg-destructive/[0.06] px-3.5 py-2.5 text-[11.5px] font-medium text-destructive"
              : "mb-4 flex items-center gap-2 rounded-[10px] border border-primary/20 bg-primary/[0.06] px-3.5 py-2.5 text-[11.5px] font-medium text-primary"
          }
        >
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          {hasErros
            ? "Preencha os campos obrigatórios (*) para finalizar a consulta."
            : "Campos com * são obrigatórios para finalizar a consulta"}
        </div>

        <div ref={procedRef}>
          <ProcedimentosCard
            procedimentos={procedimentos}
            hasError={erros.procedimentos}
            onAdd={(p) =>
              setProcedimentos((prev) => [
                ...prev,
                { ...p, id: `proc-${Date.now()}` },
              ])
            }
            onRemove={(idRem) =>
              setProcedimentos((prev) => prev.filter((p) => p.id !== idRem))
            }
          />
        </div>

        {/* AVALIAÇÃO CLÍNICA */}
        <div ref={avaliacaoRef} className="mt-4">
          <div className={CARD_CLASS}>
            <div className={SEC_LABEL_CLASS}>Avaliação clínica</div>

            <div className="mb-3.5 flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Queixa principal do paciente{" "}
                <span className="text-destructive">*</span>
              </Label>
              <textarea
                rows={2}
                value={queixa}
                onChange={(e) => setQueixa(e.target.value)}
                aria-invalid={erros.queixa}
                className={TEXTAREA_CLASS}
              />
              {erros.queixa && (
                <p className="text-xs text-destructive">
                  Informe a queixa principal do paciente.
                </p>
              )}
            </div>

            <div className="mb-3.5 flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Diagnóstico <span className="text-destructive">*</span>
              </Label>
              <textarea
                rows={2}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                aria-invalid={erros.diagnostico}
                className={TEXTAREA_CLASS}
              />
              {erros.diagnostico && (
                <p className="text-xs text-destructive">
                  Informe o diagnóstico.
                </p>
              )}
            </div>

            <div className="mb-3.5 flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Plano de tratamento{" "}
                <span className="font-normal text-muted-foreground/70">
                  — o que ainda precisa ser feito
                </span>
              </Label>
              <textarea
                rows={2}
                value={planoTratamento}
                onChange={(e) => setPlanoTratamento(e.target.value)}
                className={TEXTAREA_CLASS}
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label className={FIELD_LABEL_CLASS}>
                Observações clínicas
              </Label>
              <textarea
                rows={2}
                value={observacoesClinicas}
                onChange={(e) => setObservacoesClinicas(e.target.value)}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>
        </div>

        {/* ANAMNESE */}
        <div className="mt-4">
          <AnamneseCard
            anamnese={anamnese}
            atualizadaEm={anamneseAtualizadaEm}
            anterior={anamneseAnterior}
            onAtualizar={handleAtualizarAnamnese}
          />
        </div>

        {/* RETORNO */}
        <div className="mt-4">
          <div className={CARD_CLASS}>
            <div className={SEC_LABEL_CLASS}>Retorno</div>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-[6px]">
                <Label className={FIELD_LABEL_CLASS}>
                  Próxima consulta recomendada
                </Label>
                <Input
                  value={retorno}
                  onChange={(e) => setRetorno(maskDataBR(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  className="h-10 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 flex-shrink-0" />
              Ao preencher, a recepção receberá uma sugestão automática de
              agendamento
            </div>
          </div>
        </div>

        {/* ANEXOS */}
        <div className="mt-4">
          <AnexosCard
            anexos={anexos}
            onAdd={handleAddAnexos}
            onRemove={(idRem) =>
              setAnexos((prev) => prev.filter((a) => a.id !== idRem))
            }
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between border-t border-border bg-white px-7 py-3.5 shadow-[0_-4px_24px_rgba(15,32,80,0.04)]">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-[10px] border-[1.5px] border-border text-[12px] font-semibold text-[var(--gray-700)]"
          onClick={() => navigate("/agenda")}
        >
          Cancelar
        </Button>

        <div className="flex items-center gap-2">
          {rascunhoMsg && (
            <span className="text-[11.5px] font-medium text-green-600">
              {rascunhoMsg}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[10px] text-[12px] font-semibold"
            onClick={() => setRascunhoMsg(`Rascunho salvo às ${currentHHMM()}`)}
          >
            Salvar rascunho
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-[10px] text-[12px] font-semibold"
            onClick={handleFinalizar}
          >
            <Check className="h-3.5 w-3.5" />
            Finalizar consulta
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Registro em runtime (ledger) do fluxo clínico do paciente — item 6.
 *
 * Duas coleções:
 *  - `quoteRegistry`: orçamentos com seus itens (linhas) e status de
 *    execução de cada item. Espelha `quote` + `quote_procedure`.
 *  - `realizadosRegistry`: procedimentos realizados (histórico), espelha
 *    `appointment_procedure` (+ `appointment_procedure_tooth`).
 *
 * A "baixa" é o vínculo executado → item do orçamento: o campo
 * `quoteProcedureId` de um realizado referencia o item que o gerou —
 * mesmo papel da futura coluna `appointment_procedure.quote_procedure_id`.
 *
 * Quando a API existir, este módulo é descartável: os tipos mapeiam 1:1
 * para as tabelas do schema (V1__create-database.sql).
 */

export type QuoteStatus = "approved" | "draft" | "sent" | "rejected" | "expired";

export interface QuoteProcedureItem {
  id: string;
  procedureName: string;
  /** Dente FDI único do item (padrão atual do diálogo de orçamento). */
  toothFdi: number | null;
  unitPrice: number;
  discount: number;
  quantity: number;
  finalPrice: number;
  /** Baixa: preenchido quando o item foi executado em alguma consulta. */
  realized: boolean;
  /** Data da baixa (DD/MM/AAAA), para exibição. */
  realizedAt?: string;
  /** Id do registro de realizado que executou este item (rastros da baixa). */
  realizedBy?: string;
}

export interface QuoteRecord {
  id: number;
  description: string;
  totalValue: number;
  /** DD/MM/AAAA */
  validUntil: string;
  createdBy: string;
  status: QuoteStatus;
  items: QuoteProcedureItem[];
}

export interface RealizadoRecord {
  id: string;
  procedureName: string;
  /** Dentes FDI envolvidos (vazio = procedimento geral). */
  teeth: number[];
  /** DD/MM/AAAA */
  date: string;
  dentistName: string;
  /** "orcamento" = baixa em item de orçamento aprovado; "avulso" = avulso. */
  origin: "orcamento" | "avulso";
  value: number;
  /** Id do item do orçamento que originou este realizado (null = avulso). */
  quoteProcedureId?: string;
}

/* ============================================================
   Orçamentos (quotes) — seed
   ============================================================ */

const QUOTE_SEED: QuoteRecord[] = [
  {
    id: 1,
    description: "Profilaxia 04/25",
    totalValue: 1220,
    validUntil: "01/04/2027",
    createdBy: "Kamily Vitória",
    status: "approved",
    items: [
      { id: "q1-1", procedureName: "Profilaxia", toothFdi: null, unitPrice: 120, discount: 0, quantity: 1, finalPrice: 120, realized: true, realizedAt: "10/02/2026", realizedBy: "r-seed-1" },
      { id: "q1-2", procedureName: "Restauração em resina", toothFdi: 36, unitPrice: 350, discount: 0, quantity: 1, finalPrice: 350, realized: false },
      { id: "q1-3", procedureName: "Canal (Endodontia)", toothFdi: 46, unitPrice: 750, discount: 0, quantity: 1, finalPrice: 750, realized: false },
    ],
  },
  { id: 2, description: "Canal dente 36", totalValue: 500, validUntil: "10/04/2027", createdBy: "Kamily Vitória", status: "draft", items: [] },
  { id: 3, description: "Restauração 02/25", totalValue: 220, validUntil: "12/02/2025", createdBy: "Kamily Vitória", status: "sent", items: [] },
  { id: 4, description: "Clareamento", totalValue: 400, validUntil: "05/01/2025", createdBy: "Kamily Vitória", status: "rejected", items: [] },
  { id: 5, description: "Clareamento", totalValue: 400, validUntil: "05/01/2025", createdBy: "Kamily Vitória", status: "expired", items: [] },
];

/** Orçamentos por paciente (a ficha detalhada hoje é mock única: paciente "1"). */
const quoteRegistry = new Map<string, QuoteRecord[]>([
  ["1", QUOTE_SEED.map((q) => ({ ...q, items: q.items.map((i) => ({ ...i })) }))],
]);

/* ============================================================
   Procedimentos realizados (histórico) — seed
   ============================================================ */

const REALIZADOS_SEED: RealizadoRecord[] = [
  { id: "r-seed-1", procedureName: "Profilaxia", teeth: [], date: "10/02/2026", dentistName: "Dra. Camila Freitas", origin: "orcamento", value: 120, quoteProcedureId: "q1-1" },
  { id: "r-seed-2", procedureName: "Aplicação de flúor", teeth: [], date: "10/02/2026", dentistName: "Dra. Camila Freitas", origin: "avulso", value: 60 },
  { id: "r-seed-3", procedureName: "Canal (Endodontia)", teeth: [36], date: "21/11/2025", dentistName: "Dr. Marcos Silva", origin: "avulso", value: 750 },
  { id: "r-seed-4", procedureName: "Avaliação / Consulta", teeth: [], date: "03/08/2025", dentistName: "Dr. Marcos Silva", origin: "avulso", value: 120 },
];

const realizadosRegistry = new Map<string, RealizadoRecord[]>([
  ["1", REALIZADOS_SEED.map((r) => ({ ...r, teeth: [...r.teeth] }))],
]);

let realizadosSeq = 1;

function hojeBr(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

/* ============================================================
   API pública
   ============================================================ */

/** Orçamentos do paciente (lista viva — mutações refletem no registry). */
export function getQuotesByPatient(patientId: string): QuoteRecord[] {
  if (!quoteRegistry.has(patientId)) quoteRegistry.set(patientId, []);
  return quoteRegistry.get(patientId)!;
}

/** Histórico de procedimentos realizados do paciente (lista viva). */
export function getRealizadosByPatient(patientId: string): RealizadoRecord[] {
  if (!realizadosRegistry.has(patientId)) realizadosRegistry.set(patientId, []);
  return realizadosRegistry.get(patientId)!;
}

/**
 * Baixa: registra a execução de um item do orçamento aprovado.
 * Marca o item como realizado e cria o registro de histórico vinculado
 * (futuro `appointment_procedure` com `quote_procedure_id`).
 */
export function registerBaixa(patientId: string, item: QuoteProcedureItem, dentistName: string): RealizadoRecord {
  const realizados = getRealizadosByPatient(patientId);
  const record: RealizadoRecord = {
    id: `r-runtime-${realizadosSeq++}`,
    procedureName: item.procedureName,
    teeth: item.toothFdi ? [item.toothFdi] : [],
    date: hojeBr(),
    dentistName,
    origin: "orcamento",
    value: item.finalPrice,
    quoteProcedureId: item.id,
  };
  item.realized = true;
  item.realizedAt = record.date;
  item.realizedBy = record.id;
  realizados.unshift(record);
  return record;
}

/** Atendimento avulso: procedimento realizado sem orçamento aprovado. */
export function registerAvulso(
  patientId: string,
  input: { procedureName: string; teeth: number[]; date: string; dentistName: string; value: number },
): RealizadoRecord {
  const record: RealizadoRecord = {
    id: `r-runtime-${realizadosSeq++}`,
    procedureName: input.procedureName,
    teeth: input.teeth,
    date: input.date || hojeBr(),
    dentistName: input.dentistName,
    origin: "avulso",
    value: input.value,
  };
  getRealizadosByPatient(patientId).unshift(record);
  return record;
}

/**
 * Cria um orçamento em runtime (usado pelo NovoOrcamentoDialog).
 * Recebe as linhas do diálogo; status inicial "draft".
 */
export function addQuote(
  patientId: string,
  input: {
    description: string;
    validUntil: string;
    createdBy: string;
    totalValue: number;
    items: Omit<QuoteProcedureItem, "id" | "realized" | "realizedAt" | "realizedBy">[];
  },
): QuoteRecord {
  const quotes = getQuotesByPatient(patientId);
  const nextId = quotes.reduce((max, q) => Math.max(max, q.id), 0) + 1;
  const quote: QuoteRecord = {
    id: nextId,
    description: input.description || "Novo orçamento",
    validUntil: input.validUntil,
    createdBy: input.createdBy,
    status: "draft",
    totalValue: input.totalValue,
    items: input.items.map((item, idx) => ({
      realized: false,
      ...item,
      id: `q${nextId}-${idx + 1}`,
    })),
  };
  quotes.unshift(quote);
  return quote;
}

/**
 * Atualiza um orçamento existente (edição pelo NovoOrcamentoDialog).
 * Quando `items` é null, mantém os itens atuais (edição de cabeçalho/status).
 */
export function updateQuote(
  patientId: string,
  quoteId: number,
  patch: { description?: string; validUntil?: string; status?: QuoteStatus; totalValue?: number; items?: QuoteRecord["items"] | null },
): QuoteRecord | undefined {
  const quote = getQuotesByPatient(patientId).find((q) => q.id === quoteId);
  if (!quote) return undefined;
  if (patch.description !== undefined) quote.description = patch.description;
  if (patch.validUntil !== undefined) quote.validUntil = patch.validUntil;
  if (patch.status !== undefined) quote.status = patch.status;
  if (patch.totalValue !== undefined) quote.totalValue = patch.totalValue;
  if (patch.items) quote.items = patch.items.map((item, idx) => ({ ...item, id: item.id || `q${quoteId}-${idx + 1}` }));
  return quote;
}

/** Catálogo de procedimentos (mesmo catálogo mock do atendimento). */
export const CATALOGO_PROCEDIMENTOS = [
  { name: "Limpeza (Profilaxia)", price: 120 },
  { name: "Restauração em resina", price: 180 },
  { name: "Extração simples", price: 220 },
  { name: "Aplicação de flúor", price: 60 },
  { name: "Canal (Endodontia)", price: 650 },
  { name: "Avaliação / Consulta", price: 150 },
] as const;

export function hoje(): string {
  return hojeBr();
}
/*FIM*/
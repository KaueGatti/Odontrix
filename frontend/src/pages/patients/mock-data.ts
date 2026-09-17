/**
 * Dados mockados de pacientes.
 *
 * `MOCK_PATIENTS` é a lista "seed" de nomes — alimenta os comboboxes de
 * paciente da Agenda, dos Filtros avançados e do Novo orçamento. O
 * `patientRegistry` guarda os pacientes cadastrados em tempo de execução,
 * inclusive os criados pelo cadastro rápido do agendamento
 * (`NovoPacienteDialog`), para que passem a aparecer em todos esses lugares.
 *
 * Os registros criados pelo cadastro rápido ficam marcados como `incomplete`
 * (faltam CPF/RG, data de nascimento, endereço, telefone fixo/emergência e
 * origem). Quando a API existir, o mapeamento é direto para o `PatientInput`
 * de `POST /patients` — os campos faltantes devem ser completados antes.
 */

export const MOCK_PATIENTS = [
  "Kauê V. Gatti",
  "Fernanda R. Souza",
  "Maria S. Pereira",
  "Ana Lucia M.",
  "Roberto C. Lima",
  "Carla Mendes",
  "Bruno Tavares",
  "Marina T. Souza",
  "Paulo Henrique",
  "Juliana Costa",
  "Ricardo Oliveira",
  "Larissa Santos",
  "Thiago Ferreira",
  "Amanda Nunes",
  "Gabriel Silva",
];

export interface MockPatientResponsible {
  fullName: string;
  cpf?: string;
  rg?: string;
}

export interface MockPatient {
  id: string;
  fullName: string;
  cellPhone?: string;
  isMinor: boolean;
  responsible?: MockPatientResponsible;
  /** Cadastro rápido: faltam campos obrigatórios do `PatientInput` da API. */
  incomplete: boolean;
  createdAt: string;
}

export interface MockPatientInput {
  fullName: string;
  cellPhone: string;
  isMinor: boolean;
  responsible?: MockPatientResponsible;
}

/** Pacientes cadastrados em runtime (não inclui os nomes seed). */
const patientRegistry = new Map<string, MockPatient>();

/** Mesma regra de slug usada nos `patientId` derivados do nome na Agenda. */
function slugifyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPatientId(fullName: string): string {
  const base = `pat-${slugifyName(fullName) || "sem-nome"}`;
  if (!patientRegistry.has(base)) return base;

  let suffix = 2;
  while (patientRegistry.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Nomes disponíveis nos comboboxes: seed + cadastrados em runtime. */
export function listMockPatientNames(): string[] {
  const names = [...MOCK_PATIENTS];
  for (const patient of patientRegistry.values()) {
    if (!names.includes(patient.fullName)) names.push(patient.fullName);
  }
  return names;
}

export function addMockPatient(input: MockPatientInput): MockPatient {
  const patient: MockPatient = {
    id: buildPatientId(input.fullName),
    fullName: input.fullName.trim(),
    cellPhone: input.cellPhone.trim(),
    isMinor: input.isMinor,
    responsible: input.responsible,
    incomplete: true,
    createdAt: new Date().toISOString(),
  };

  patientRegistry.set(patient.id, patient);
  return patient;
}

export function findMockPatientByName(
  fullName: string
): MockPatient | undefined {
  for (const patient of patientRegistry.values()) {
    if (patient.fullName === fullName) return patient;
  }
  return undefined;
}

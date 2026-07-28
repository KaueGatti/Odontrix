import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import {
    Building2,
    Banknote,
    Bell,
    ShieldCheck,
    UploadCloud,
    Check,
    Clock,
    ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils.ts";
import { maskCEP, maskCNPJ, maskTelefone } from "@/lib/masks.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ------------------------------------------------------------------ */
/* Tipos e dados estáticos                                             */
/* ------------------------------------------------------------------ */

type TabId = "institucional" | "financeiro" | "notificacoes" | "seguranca";

interface TabConfig {
    id: TabId;
    label: string;
    icon: typeof Building2;
}

const TABS: TabConfig[] = [
    { id: "institucional", label: "Dados Institucionais", icon: Building2 },
    { id: "financeiro", label: "Financeiro", icon: Banknote },
    { id: "notificacoes", label: "Notificações e Lembretes", icon: Bell },
    { id: "seguranca", label: "Segurança e Sessão", icon: ShieldCheck },
];

const BANCOS = ["Sicredi", "Banco do Brasil", "Itaú", "Bradesco"];

const LEMBRETE_OPTIONS = [
    { value: "1h", label: "1 hora antes" },
    { value: "3h", label: "3 horas antes" },
    { value: "24h", label: "24 horas antes" },
    { value: "48h", label: "48 horas antes" },
];

const SESSAO_OPTIONS = [
    { value: "5", label: "5 minutos" },
    { value: "15", label: "15 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "60", label: "1 hora" },
];

/* ------------------------------------------------------------------ */
/* Componentes reutilizáveis da tela                                   */
/* ------------------------------------------------------------------ */

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "mb-4 max-w-[820px] rounded-[14px] border border-slate-200 bg-white p-[22px] shadow-[0_4px_24px_rgba(15,32,80,0.05)]",
                className,
            )}
        >
            {children}
        </div>
    );
}

function CardHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <>
            <div className="mb-[3px] text-[15px] font-bold tracking-[-0.2px] text-slate-900">
                {title}
            </div>
            {subtitle && <div className="mb-[18px] text-[11.5px] text-slate-400">{subtitle}</div>}
        </>
    );
}

function FormGrid({
                      cols,
                      children,
                      className,
                  }: {
    cols: "2" | "3" | "413";
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "grid gap-3.5",
                cols === "2" && "grid-cols-2",
                cols === "3" && "grid-cols-3",
                cols === "413" && "grid-cols-[2fr_1fr_1fr_1fr]",
                className,
            )}
        >
            {children}
        </div>
    );
}

interface FieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    /** Formata o valor a cada digitação (ex: maskCNPJ, maskTelefone, maskCEP). */
    mask?: (value: string) => string;
}

function TextField({ label, required, hint, value, onChange, mask }: FieldProps) {
    return (
        <div>
            <Label className="mb-[5px] block text-[11.5px] font-medium text-slate-700">
                {label} {required && <span className="text-red-400">*</span>}
                {hint && <span className="font-normal text-slate-400"> {hint}</span>}
            </Label>
            <Input
                value={value}
                onChange={(e) => onChange(mask ? mask(e.target.value) : e.target.value)}
                inputMode={mask ? "numeric" : undefined}
                className="h-[34px] rounded-[10px] border-slate-200 bg-slate-50 text-[12.5px] focus-visible:border-primary focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-primary/15"
            />
        </div>
    );
}

interface SelectFieldProps {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

function SelectField({ label, required, value, onChange, options }: SelectFieldProps) {
    return (
        <div>
            <Label className="mb-[5px] block text-[11.5px] font-medium text-slate-700">
                {label} {required && <span className="text-red-400">*</span>}
            </Label>
            <Select.Root value={value} onValueChange={onChange}>
                <Select.Trigger className="flex h-[34px] w-full items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-[11px] text-[12.5px] text-slate-900 outline-none data-[state=open]:border-primary data-[state=open]:bg-white">
                    <Select.Value />
                    <Select.Icon>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content
                        position="popper"
                        sideOffset={4}
                        className="z-50 overflow-hidden rounded-[10px] border border-slate-200 bg-white text-[12.5px] shadow-[0_4px_24px_rgba(15,32,80,0.08)]"
                    >
                        <Select.Viewport className="p-1">
                            {options.map((option) => (
                                <Select.Item
                                    key={option.value}
                                    value={option.value}
                                    className="cursor-pointer select-none rounded-[6px] px-3 py-2 text-slate-700 outline-none data-[highlighted]:bg-slate-50 data-[state=checked]:font-medium data-[state=checked]:text-primary"
                                >
                                    <Select.ItemText>{option.label}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}

function FooterSave({
                        onSave,
                        className,
                    }: {
    onSave?: () => void;
    className?: string;
}) {
    return (
        <div className={cn("flex max-w-[820px] justify-end gap-2", className)}>
            <Button className="h-[34px] rounded-[10px] text-[12.5px]" onClick={onSave}>
                <Check className="h-[13px] w-[13px]" />
                Salvar alterações
            </Button>
        </div>
    );
}

function FutureNote({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-[14px] py-3 text-[11.5px] leading-[1.55] text-slate-400">
            <Clock className="mt-[1px] h-[14px] w-[14px] flex-shrink-0" />
            <div>{children}</div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Painéis                                                              */
/* ------------------------------------------------------------------ */

function PainelInstitucional() {
    const [clinica, setClinica] = useState({
        nome: "OdontoSys Clínica Odontológica",
        cnpj: "12.345.678/0001-90",
        telefone: "(19) 3456-7890",
        email: "contato@odontosys.com.br",
    });
    const [endereco, setEndereco] = useState({
        rua: "Av. Brasil",
        numero: "1200",
        complemento: "Sala 4",
        cep: "13500-000",
        bairro: "Centro",
        cidade: "Rio Claro",
        estado: "SP",
    });
    const [horario, setHorario] = useState({ abertura: "08:00", fechamento: "19:00" });

    return (
        <div className="max-w-[1200px]">
            <Card className="max-w-none">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-3 lg:items-start">
                    <div className="lg:col-span-2">
                        <CardHeading
                            title="Identidade da clínica"
                            subtitle="Usado em documentos, recibos e relatórios gerados pelo sistema"
                        />

                        <div className="mb-[18px]">
                            <Label className="mb-[5px] block text-[11.5px] font-medium text-slate-700">
                                Logo da clínica
                            </Label>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary text-[20px] font-bold text-white">
                                    OS
                                </div>
                                <button
                                    type="button"
                                    className="flex-1 rounded-[10px] border-[1.5px] border-dashed border-slate-200 px-4 py-3.5 text-center text-[11.5px] text-slate-400 transition-colors hover:border-primary hover:bg-primary/[0.04]"
                                >
                                    <UploadCloud className="mx-auto mb-1 h-4 w-4" />
                                    Arraste uma imagem ou clique para selecionar
                                    <br />
                                    <span className="text-[10px]">PNG ou SVG, fundo transparente recomendado</span>
                                </button>
                            </div>
                        </div>

                        <FormGrid cols="2" className="mb-3.5">
                            <TextField
                                label="Nome da clínica"
                                required
                                value={clinica.nome}
                                onChange={(v) => setClinica((s) => ({ ...s, nome: v }))}
                            />
                            <TextField
                                label="CNPJ"
                                required
                                value={clinica.cnpj}
                                onChange={(v) => setClinica((s) => ({ ...s, cnpj: v }))}
                                mask={maskCNPJ}
                            />
                        </FormGrid>
                        <FormGrid cols="2">
                            <TextField
                                label="Telefone"
                                required
                                value={clinica.telefone}
                                onChange={(v) => setClinica((s) => ({ ...s, telefone: v }))}
                                mask={maskTelefone}
                            />
                            <TextField
                                label="E-mail de contato"
                                value={clinica.email}
                                onChange={(v) => setClinica((s) => ({ ...s, email: v }))}
                            />
                        </FormGrid>
                    </div>

                    <div className="border-slate-100 lg:col-span-1 lg:border-l lg:pl-8 h-full">
                        <CardHeading
                            title="Horário de funcionamento"
                            subtitle="Limite geral da clínica — os horários individuais de cada dentista não podem ultrapassar esta faixa"
                        />
                        <FormGrid cols="2">
                            <TextField
                                label="Abertura"
                                required
                                value={horario.abertura}
                                onChange={(v) => setHorario((s) => ({ ...s, abertura: v }))}
                            />
                            <TextField
                                label="Fechamento"
                                required
                                value={horario.fechamento}
                                onChange={(v) => setHorario((s) => ({ ...s, fechamento: v }))}
                            />
                        </FormGrid>
                    </div>
                </div>

                <hr className="my-3 border-t-[1.5px] border-slate-100" />

                <CardHeading title="Endereço" />
                <FormGrid cols="413" className="mb-3.5">
                    <TextField
                        label="Rua"
                        required
                        value={endereco.rua}
                        onChange={(v) => setEndereco((s) => ({ ...s, rua: v }))}
                    />
                    <TextField
                        label="Número"
                        required
                        value={endereco.numero}
                        onChange={(v) => setEndereco((s) => ({ ...s, numero: v }))}
                    />
                    <TextField
                        label="Complemento"
                        value={endereco.complemento}
                        onChange={(v) => setEndereco((s) => ({ ...s, complemento: v }))}
                    />
                    <TextField
                        label="CEP"
                        required
                        value={endereco.cep}
                        onChange={(v) => setEndereco((s) => ({ ...s, cep: v }))}
                        mask={maskCEP}
                    />
                </FormGrid>
                <FormGrid cols="3">
                    <TextField
                        label="Bairro"
                        required
                        value={endereco.bairro}
                        onChange={(v) => setEndereco((s) => ({ ...s, bairro: v }))}
                    />
                    <TextField
                        label="Cidade"
                        required
                        value={endereco.cidade}
                        onChange={(v) => setEndereco((s) => ({ ...s, cidade: v }))}
                    />
                    <TextField
                        label="Estado"
                        required
                        value={endereco.estado}
                        onChange={(v) => setEndereco((s) => ({ ...s, estado: v }))}
                    />
                </FormGrid>
            </Card>

            <FooterSave className="mt-4 max-w-none" />
        </div>
    );
}

function PainelFinanceiro() {
    const [dadosBancarios, setDadosBancarios] = useState({
        banco: "Sicredi",
        convenio: "123456",
        agencia: "0001",
        conta: "12345-6",
    });
    const [regrasCobranca, setRegrasCobranca] = useState({
        juros: "1,00",
        multa: "2,00",
        vencimento: "30",
    });

    return (
        <>
            <Card>
                <CardHeading title="Dados bancários" subtitle="Usados na emissão de boletos" />
                <FormGrid cols="2" className="mb-3.5">
                    <SelectField
                        label="Banco"
                        required
                        value={dadosBancarios.banco}
                        onChange={(v) => setDadosBancarios((s) => ({ ...s, banco: v }))}
                        options={BANCOS.map((b) => ({ value: b, label: b }))}
                    />
                    <TextField
                        label="Convênio / Código do cedente"
                        required
                        value={dadosBancarios.convenio}
                        onChange={(v) => setDadosBancarios((s) => ({ ...s, convenio: v }))}
                    />
                </FormGrid>
                <FormGrid cols="2">
                    <TextField
                        label="Agência"
                        required
                        value={dadosBancarios.agencia}
                        onChange={(v) => setDadosBancarios((s) => ({ ...s, agencia: v }))}
                    />
                    <TextField
                        label="Conta"
                        required
                        value={dadosBancarios.conta}
                        onChange={(v) => setDadosBancarios((s) => ({ ...s, conta: v }))}
                    />
                </FormGrid>
            </Card>

            <Card>
                <CardHeading
                    title="Regras de cobrança"
                    subtitle="Aplicadas automaticamente a parcelas em atraso"
                />
                <FormGrid cols="3">
                    <TextField
                        label="Juros ao mês"
                        hint="(%)"
                        value={regrasCobranca.juros}
                        onChange={(v) => setRegrasCobranca((s) => ({ ...s, juros: v }))}
                    />
                    <TextField
                        label="Multa por atraso"
                        hint="(%)"
                        value={regrasCobranca.multa}
                        onChange={(v) => setRegrasCobranca((s) => ({ ...s, multa: v }))}
                    />
                    <TextField
                        label="Vencimento padrão"
                        hint="— dias após a 1ª parcela"
                        value={regrasCobranca.vencimento}
                        onChange={(v) => setRegrasCobranca((s) => ({ ...s, vencimento: v }))}
                    />
                </FormGrid>
            </Card>

            <FooterSave />
        </>
    );
}

function PainelNotificacoes() {
    const [antecedencia, setAntecedencia] = useState("24h");

    return (
        <>
            <Card>
                <CardHeading
                    title="Lembrete de consulta"
                    subtitle="Antecedência do lembrete automático enviado ao paciente"
                />
                <FormGrid cols="2" className="max-w-[460px]">
                    <SelectField
                        label="Enviar lembrete com antecedência de"
                        required
                        value={antecedencia}
                        onChange={setAntecedencia}
                        options={LEMBRETE_OPTIONS}
                    />
                </FormGrid>

                <FutureNote>
                    Canal de envio (WhatsApp, e-mail ou SMS) e personalização de templates de mensagem
                    ficam para uma versão futura. Por enquanto, apenas a antecedência é configurável.
                </FutureNote>
            </Card>

            <FooterSave />
        </>
    );
}

function PainelSeguranca() {
    const [inatividade, setInatividade] = useState("15");

    return (
        <>
            <Card>
                <CardHeading
                    title="Sessão"
                    subtitle="Controla o encerramento automático de sessões inativas"
                />
                <FormGrid cols="2" className="max-w-[460px]">
                    <SelectField
                        label="Encerrar sessão após inatividade de"
                        required
                        value={inatividade}
                        onChange={setInatividade}
                        options={SESSAO_OPTIONS}
                    />
                </FormGrid>
            </Card>

            <FooterSave />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Página                                                               */
/* ------------------------------------------------------------------ */

export function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState<TabId>("institucional");

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-auto px-9 py-7">
                <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
                    <Tabs.List className="mb-[22px] flex flex-wrap gap-2">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <Tabs.Trigger
                                key={id}
                                value={id}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full border-[1.5px] border-slate-200 bg-white px-4 py-2 text-[12.5px] font-medium text-slate-500 transition-all",
                                    "hover:border-slate-300 hover:text-slate-700",
                                    "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_rgba(79,126,247,0.32)]",
                                )}
                            >
                                <Icon className="h-[14px] w-[14px]" />
                                {label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <Tabs.Content value="institucional">
                        <PainelInstitucional />
                    </Tabs.Content>
                    <Tabs.Content value="financeiro">
                        <PainelFinanceiro />
                    </Tabs.Content>
                    <Tabs.Content value="notificacoes">
                        <PainelNotificacoes />
                    </Tabs.Content>
                    <Tabs.Content value="seguranca">
                        <PainelSeguranca />
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        </div>
    );
}
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as Select from "@radix-ui/react-select";
import { Pencil, Plus, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils.ts";
import { maskMoney } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ------------------------------------------------------------------ */
/* Tipos genéricos                                                      */
/* ------------------------------------------------------------------ */

/**
 * Registro genérico de uma lista auxiliar (especialidade, método de
 * pagamento, procedimento, etc). Usar um shape solto (Record<string, FieldValue>)
 * aqui é uma troca deliberada: perde-se alguma tipagem forte por campo,
 * mas ganha-se UM ÚNICO componente (EntityListSection) reutilizado pelas
 * 8 listas desta tela, em vez de 8 componentes quase idênticos.
 * Se algum desses cadastros crescer muito em regras próprias, vale a
 * pena "graduar" ele pra um componente dedicado e tipado.
 */
/** Todo campo desta tela é texto (text/textarea/currency/select) ou switch. */
type FieldValue = string | boolean;

type EntityRecord = { id: string } & Record<string, FieldValue>;

interface ColumnDef {
    key: string;
    label: string;
    render?: (item: EntityRecord) => React.ReactNode;
}

type FieldDef =
    | { key: string; label: string; type: "text"; required?: boolean; placeholder?: string }
    | { key: string; label: string; type: "textarea"; placeholder?: string }
    | { key: string; label: string; type: "currency"; required?: boolean }
    | { key: string; label: string; type: "select"; required?: boolean; options: { value: string; label: string }[] }
    | { key: string; label: string; type: "switch"; hint?: string };

/* ------------------------------------------------------------------ */
/* Peças visuais reutilizáveis                                         */
/* ------------------------------------------------------------------ */

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span className={cn("badge", active ? "badge-green" : "badge-gray")}>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {active ? "Ativo" : "Inativo"}
        </span>
    );
}

function TipoBadge({ tipo }: { tipo: string }) {
    return (
        <span className={cn("badge", tipo === "Receita" ? "badge-blue" : "badge-red")}>
            {tipo}
        </span>
    );
}

function SectionCard({ subTabs, children }: { subTabs?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] shadow-[var(--shadow-card)]">
            {subTabs}
            <div className="p-6">{children}</div>
        </div>
    );
}

function SubTabList({ children }: { children: React.ReactNode }) {
    return <Tabs.List className="flex gap-6 border-b border-[var(--gray-100)] px-6 pt-4">{children}</Tabs.List>;
}

function SubTabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
    return (
        <Tabs.Trigger
            value={value}
            className="border-b-2 border-transparent pb-3 text-[12.5px] font-medium text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--gray-700)] data-[state=active]:border-[var(--blue)] data-[state=active]:font-semibold data-[state=active]:text-[var(--blue)]"
        >
            {children}
        </Tabs.Trigger>
    );
}

/* ------------------------------------------------------------------ */
/* Campo de formulário genérico (usado dentro do modal)                */
/* ------------------------------------------------------------------ */

function FormField({
                       field,
                       value,
                       onChange,
                   }: {
    field: FieldDef;
    value: FieldValue;
    onChange: (value: FieldValue) => void;
}) {
    if (field.type === "switch") {
        return (
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{field.label}</div>
                    {field.hint && <div className="mt-0.5 max-w-[260px] text-[11px] text-[var(--color-text-tertiary)]">{field.hint}</div>}
                </div>
                <SwitchPrimitive.Root
                    checked={!!value}
                    onCheckedChange={onChange}
                    className="relative h-5 w-9 flex-shrink-0 rounded-full bg-[var(--color-border-tertiary)] outline-none transition-colors data-[state=checked]:bg-[var(--blue)]"
                >
                    <SwitchPrimitive.Thumb className="block h-3.5 w-3.5 translate-x-1 rounded-full bg-[var(--color-background-primary)] shadow transition-transform data-[state=checked]:translate-x-[18px]" />
                </SwitchPrimitive.Root>
            </div>
        );
    }

    // Os inputs de texto abaixo (textarea/currency/select/text) só existem para
    // campos cujo valor é sempre string — isso restringe o `FieldValue`
    // (string | boolean) sem precisar de `any`.
    const stringValue = typeof value === "string" ? value : "";

    return (
        <div>
            <Label className="mb-[5px] block text-[11.5px] font-medium text-[var(--gray-700)]">
                {field.label} {"required" in field && field.required && <span className="text-[var(--red)]">*</span>}
            </Label>

            {field.type === "textarea" && (
                <textarea
                    value={stringValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full resize-none rounded-[var(--border-radius-md)] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-2.5 text-[12.5px] text-[var(--color-text-primary)] outline-none focus:border-[var(--blue)] focus:bg-[var(--color-background-primary)]"
                />
            )}

            {field.type === "currency" && (
                <div className="flex h-[34px] items-center rounded-[var(--border-radius-md)] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] pl-3 focus-within:border-[var(--blue)] focus-within:bg-[var(--color-background-primary)]">
                    <span className="mr-1.5 text-[12.5px] text-[var(--color-text-tertiary)]">R$</span>
                    <input
                        value={stringValue}
                        onChange={(e) => onChange(maskMoney(e.target.value, false))}
                        placeholder="0,00"
                        inputMode="decimal"
                        className="h-full w-full bg-transparent text-[12.5px] text-[var(--color-text-primary)] outline-none"
                    />
                </div>
            )}

            {field.type === "select" && (
                <Select.Root value={stringValue} onValueChange={onChange}>
                    <Select.Trigger className="flex h-[34px] w-full items-center justify-between rounded-[var(--border-radius-md)] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-[11px] text-[12.5px] text-[var(--color-text-primary)] outline-none data-[state=open]:border-[var(--blue)] data-[state=open]:bg-[var(--color-background-primary)]">
                        <Select.Value placeholder="Selecione..." />
                        <Select.Icon>
                            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                        </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            position="popper"
                            sideOffset={4}
                            className="z-50 overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[12.5px] shadow-[var(--shadow-card)]"
                        >
                            <Select.Viewport className="p-1">
                                {field.options.map((opt) => (
                                    <Select.Item
                                        key={opt.value}
                                        value={opt.value}
                                        className="cursor-pointer select-none rounded-[6px] px-3 py-2 text-[var(--gray-700)] outline-none data-[highlighted]:bg-[var(--color-background-secondary)] data-[state=checked]:font-medium data-[state=checked]:text-[var(--blue)]"
                                    >
                                        <Select.ItemText>{opt.label}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            )}

            {field.type === "text" && (
                <Input
                    value={stringValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="h-[34px] rounded-[var(--border-radius-md)] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] text-[12.5px] focus-visible:border-[var(--blue)] focus-visible:bg-[var(--color-background-primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--blue)]/15"
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Modal de criar/editar (genérico, dirigido por `fields`)              */
/* ------------------------------------------------------------------ */

function RecordFormDialog({
                              open,
                              onOpenChange,
                              title,
                              fields,
                              values,
                              onChange,
                              onCancel,
                              onSubmit,
                              submitLabel,
                          }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    fields: FieldDef[];
    values: Record<string, FieldValue>;
    onChange: (key: string, value: FieldValue) => void;
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel: string;
}) {
    const hasRequired = fields.some((f) => "required" in f && f.required);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="bg-[var(--gray-900)]/30" />
                <DialogContent className="w-[380px] p-5">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] text-[var(--color-text-primary)]">
                            {title}
                        </DialogTitle>
                    </DialogHeader>

                    {hasRequired && (
                        <div className="mb-4 rounded-[var(--border-radius-sm)] border border-[var(--red)]/20 bg-[var(--red)]/[0.07] px-3 py-2 text-[11px] text-[var(--red)]">
                            Campos marcados com <span className="font-semibold">*</span> são obrigatórios
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {fields.map((field) => (
                            <FormField
                                key={field.key}
                                field={field}
                                value={values[field.key]}
                                onChange={(v) => onChange(field.key, v)}
                            />
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit}>
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Lista + modal de uma entidade auxiliar (o "molde" reaproveitado      */
/* pelas 8 listas da tela: métodos de pagamento, especialidades,        */
/* tipos de anexo, tipos de consulta, centros de custo, procedimentos,  */
/* motivos de cancelamento e origem do paciente)                        */
/* ------------------------------------------------------------------ */

function EntityListSection({
                               title,
                               subtitle,
                               addLabel,
                               addBottomLabel,
                               dialogTitleCreate,
                               dialogTitleEdit,
                               submitCreateLabel,
                               columns,
                               items,
                               setItems,
                               fields,
                               createDefaults,
                           }: {
    title: string;
    subtitle: string;
    addLabel: string;
    addBottomLabel: string;
    dialogTitleCreate: string;
    dialogTitleEdit: string;
    submitCreateLabel: string;
    columns: ColumnDef[];
    items: EntityRecord[];
    setItems: React.Dispatch<React.SetStateAction<EntityRecord[]>>;
    fields: FieldDef[];
    createDefaults: Record<string, FieldValue>;
}) {
    const [dialog, setDialog] = useState<{ mode: "create" | "edit"; values: Record<string, FieldValue> } | null>(null);

    function openCreate() {
        setDialog({ mode: "create", values: { ...createDefaults } });
    }

    function openEdit(item: EntityRecord) {
        setDialog({ mode: "edit", values: { ...item } });
    }

    function handleSubmit() {
        if (!dialog) return;
        if (dialog.mode === "create") {
            setItems((prev) => [...prev, { id: crypto.randomUUID(), ...dialog.values }]);
        } else {
            setItems((prev) => prev.map((item) => (item.id === dialog.values.id ? { ...item, ...dialog.values } : item)));
        }
        setDialog(null);
    }

    const primaryKey = columns[0]?.key ?? "id";

    return (
        <>
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <div className="text-[15px] font-bold text-[var(--color-text-primary)]">{title}</div>
                    <div className="text-[11.5px] text-[var(--color-text-tertiary)]">{subtitle}</div>
                </div>
                <Button onClick={openCreate} className="h-[34px] shrink-0 rounded-[var(--border-radius-md)] text-[12.5px]">
                    <Plus className="h-3.5 w-3.5" />
                    {addLabel}
                </Button>
            </div>

            <table className="w-full border-collapse text-left">
                <thead>
                <tr className="border-b border-[var(--gray-100)]">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className="pb-2 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]"
                        >
                            {col.label}
                        </th>
                    ))}
                    <th className="pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        Ações
                    </th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--color-background-secondary)] last:border-0">
                        {columns.map((col) => (
                            <td key={col.key} className="py-2.5 text-[12.5px] text-[var(--gray-700)]">
                                {col.render ? col.render(item) : item[col.key]}
                            </td>
                        ))}
                        <td className="py-2.5 text-right">
                            <div className="inline-flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    aria-label={`Editar ${item[primaryKey]}`}
                                    className="rounded-[6px] border border-[var(--color-border-tertiary)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--gray-300)] hover:text-[var(--gray-700)]"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button
                type="button"
                onClick={openCreate}
                className="mt-3 w-full rounded-[var(--border-radius-md)] border-[1.5px] border-dashed border-[var(--blue)]/30 bg-[var(--blue)]/[0.03] py-2.5 text-center text-[12px] font-medium text-[var(--blue)] transition-colors hover:bg-[var(--blue)]/[0.06]"
            >
                {addBottomLabel}
            </button>

            <RecordFormDialog
                open={!!dialog}
                onOpenChange={(open) => !open && setDialog(null)}
                title={dialog?.mode === "edit" ? dialogTitleEdit : dialogTitleCreate}
                fields={fields}
                values={dialog?.values ?? {}}
                onChange={(key, value) => setDialog((d) => (d ? { ...d, values: { ...d.values, [key]: value } } : d))}
                onCancel={() => setDialog(null)}
                onSubmit={handleSubmit}
                submitLabel={dialog?.mode === "edit" ? "Salvar alterações" : submitCreateLabel}
            />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Aba: Clínico (Especialidades / Tipos de Consulta / Procedimentos)   */
/* ------------------------------------------------------------------ */

function ClinicoTab() {
    const [subTab, setSubTab] = useState("especialidades");

    const [especialidades, setEspecialidades] = useState<EntityRecord[]>([
        { id: "1", nome: "Ortodontia", status: true },
        { id: "2", nome: "Endodontia", status: true },
        { id: "3", nome: "Periodontia", status: false },
    ]);

    const [tiposConsulta, setTiposConsulta] = useState<EntityRecord[]>([
        { id: "1", nome: "Consulta Inicial", descricao: "Primeira consulta", status: true },
        { id: "2", nome: "Retorno", descricao: "Acompanhamento", status: true },
        { id: "3", nome: "Emergência", descricao: "Atendimento urgente", status: true },
    ]);

    const [procedimentos, setProcedimentos] = useState<EntityRecord[]>([
        { id: "1", nome: "Limpeza / Profilaxia", descricao: "Remoção de tártaro", preco: "180,00", status: true },
        { id: "2", nome: "Extração simples", descricao: "Dente não incluso", preco: "250,00", status: true },
        { id: "3", nome: "Clareamento dental", descricao: "Clareamento a laser", preco: "1.200,00", status: true },
    ]);

    return (
        <Tabs.Root value={subTab} onValueChange={setSubTab}>
            <SectionCard
                subTabs={
                    <SubTabList>
                        <SubTabTrigger value="especialidades">Especialidades</SubTabTrigger>
                        <SubTabTrigger value="tipos-consulta">Tipos de Consulta</SubTabTrigger>
                        <SubTabTrigger value="procedimentos">Procedimentos</SubTabTrigger>
                    </SubTabList>
                }
            >
                <Tabs.Content value="especialidades">
                    <EntityListSection
                        title="Especialidades"
                        subtitle="Especialidades odontológicas"
                        addLabel="Nova Especialidade"
                        addBottomLabel="+ Adicionar nova especialidade"
                        dialogTitleCreate="Nova Especialidade"
                        dialogTitleEdit="Editar Especialidade"
                        submitCreateLabel="Criar especialidade"
                        columns={[
                            { key: "nome", label: "Nome" },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={especialidades}
                        setItems={setEspecialidades}
                        fields={[
                            { key: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex: Ortodontia" },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em agendamentos" },
                        ]}
                        createDefaults={{ nome: "", status: true }}
                    />
                </Tabs.Content>

                <Tabs.Content value="tipos-consulta">
                    <EntityListSection
                        title="Tipos de Consulta"
                        subtitle="Categorias de atendimento"
                        addLabel="Novo Tipo de Consulta"
                        addBottomLabel="+ Adicionar novo tipo de consulta"
                        dialogTitleCreate="Novo Tipo de Consulta"
                        dialogTitleEdit="Editar Tipo de Consulta"
                        submitCreateLabel="Criar tipo de consulta"
                        columns={[
                            { key: "nome", label: "Nome" },
                            { key: "descricao", label: "Descrição" },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={tiposConsulta}
                        setItems={setTiposConsulta}
                        fields={[
                            { key: "nome", label: "Nome", type: "text", required: true },
                            { key: "descricao", label: "Descrição", type: "textarea" },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em agendamentos" },
                        ]}
                        createDefaults={{ nome: "", descricao: "", status: true }}
                    />
                </Tabs.Content>

                <Tabs.Content value="procedimentos">
                    <EntityListSection
                        title="Procedimentos"
                        subtitle="Procedimentos e preços de referência"
                        addLabel="Novo Procedimento"
                        addBottomLabel="+ Adicionar novo procedimento"
                        dialogTitleCreate="Novo Procedimento"
                        dialogTitleEdit="Editar Procedimento"
                        submitCreateLabel="Criar procedimento"
                        columns={[
                            { key: "nome", label: "Nome" },
                            { key: "descricao", label: "Descrição" },
                            { key: "preco", label: "Preço Ref.", render: (i) => `R$ ${i.preco}` },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={procedimentos}
                        setItems={setProcedimentos}
                        fields={[
                            { key: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex: Limpeza / Profilaxia" },
                            {
                                key: "descricao",
                                label: "Descrição",
                                type: "textarea",
                                placeholder: "Descreva o procedimento (opcional)",
                            },
                            { key: "preco", label: "Preço de Referência (R$)", type: "currency", required: true },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em agendamentos" },
                        ]}
                        createDefaults={{ nome: "", descricao: "", preco: "", status: true }}
                    />
                </Tabs.Content>
            </SectionCard>
        </Tabs.Root>
    );
}

/* ------------------------------------------------------------------ */
/* Aba: Financeiro (Métodos de Pagamento / Centros de Custo)            */
/* ------------------------------------------------------------------ */

function FinanceiroTab() {
    const [subTab, setSubTab] = useState("metodos-pagamento");

    const [metodosPagamento, setMetodosPagamento] = useState<EntityRecord[]>([
        { id: "1", descricao: "Dinheiro", status: true },
        { id: "2", descricao: "Cartão de Crédito", status: true },
        { id: "3", descricao: "PIX", status: true },
    ]);

    const [centrosCusto, setCentrosCusto] = useState<EntityRecord[]>([
        { id: "1", nome: "Consultas", tipo: "Receita", status: true },
        { id: "2", nome: "Materiais", tipo: "Despesa", status: true },
        { id: "3", nome: "Aluguel", tipo: "Despesa", status: false },
    ]);

    return (
        <Tabs.Root value={subTab} onValueChange={setSubTab}>
            <SectionCard
                subTabs={
                    <SubTabList>
                        <SubTabTrigger value="metodos-pagamento">Métodos de Pagamento</SubTabTrigger>
                        <SubTabTrigger value="centros-custo">Centros de Custo</SubTabTrigger>
                    </SubTabList>
                }
            >
                <Tabs.Content value="metodos-pagamento">
                    <EntityListSection
                        title="Métodos de Pagamento"
                        subtitle="Formas de pagamento aceitas"
                        addLabel="Novo Método"
                        addBottomLabel="+ Adicionar novo método de pagamento"
                        dialogTitleCreate="Novo Método de Pagamento"
                        dialogTitleEdit="Editar Método de Pagamento"
                        submitCreateLabel="Criar método"
                        columns={[
                            { key: "descricao", label: "Descrição" },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={metodosPagamento}
                        setItems={setMetodosPagamento}
                        fields={[
                            { key: "descricao", label: "Descrição", type: "text", required: true, placeholder: "Ex: Dinheiro" },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em pagamentos" },
                        ]}
                        createDefaults={{ descricao: "", status: true }}
                    />
                </Tabs.Content>

                <Tabs.Content value="centros-custo">
                    <EntityListSection
                        title="Centros de Custo"
                        subtitle="Classificação de receitas e despesas"
                        addLabel="Novo centro"
                        addBottomLabel="+ Adicionar novo centro de custo"
                        dialogTitleCreate="Novo Centro de Custo"
                        dialogTitleEdit="Editar Centro de Custo"
                        submitCreateLabel="Criar centro"
                        columns={[
                            { key: "nome", label: "Nome" },
                            { key: "tipo", label: "Tipo", render: (i) => <TipoBadge tipo={String(i.tipo)} /> },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={centrosCusto}
                        setItems={setCentrosCusto}
                        fields={[
                            { key: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex: Consultas" },
                            {
                                key: "tipo",
                                label: "Tipo",
                                type: "select",
                                required: true,
                                options: [
                                    { value: "Receita", label: "Receita" },
                                    { value: "Despesa", label: "Despesa" },
                                ],
                            },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em lançamentos" },
                        ]}
                        createDefaults={{ nome: "", tipo: "Receita", status: true }}
                    />
                </Tabs.Content>
            </SectionCard>
        </Tabs.Root>
    );
}

/* ------------------------------------------------------------------ */
/* Aba: Sistema (só Tipos de Anexo — sem sub-abas)                      */
/* ------------------------------------------------------------------ */

function SistemaTab() {
    const [tiposAnexo, setTiposAnexo] = useState<EntityRecord[]>([
        { id: "1", descricao: "Radiografia", status: true },
        { id: "2", descricao: "Receituário", status: true },
        { id: "3", descricao: "Laudo médico", status: true },
    ]);

    return (
        <SectionCard>
            <EntityListSection
                title="Tipos de Anexo"
                subtitle="Categorias de documentos e arquivos"
                addLabel="Novo Tipo de Anexo"
                addBottomLabel="+ Adicionar novo tipo de anexo"
                dialogTitleCreate="Novo Tipo de Anexo"
                dialogTitleEdit="Editar Tipo de Anexo"
                submitCreateLabel="Criar tipo de anexo"
                columns={[
                    { key: "descricao", label: "Descrição" },
                    { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                ]}
                items={tiposAnexo}
                setItems={setTiposAnexo}
                fields={[
                    { key: "descricao", label: "Descrição", type: "text", required: true, placeholder: "Ex: Radiografia" },
                    { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em anexos" },
                ]}
                createDefaults={{ descricao: "", status: true }}
            />
        </SectionCard>
    );
}

/* ------------------------------------------------------------------ */
/* Aba: Atendimento (Motivos de Cancelamento / Origem do Paciente)      */
/* ------------------------------------------------------------------ */

function AtendimentoTab() {
    const [subTab, setSubTab] = useState("motivos-cancelamento");

    const [motivosCancelamento, setMotivosCancelamento] = useState<EntityRecord[]>([
        { id: "1", descricao: "Paciente desmarcou", status: true },
        { id: "2", descricao: "Paciente não compareceu (no-show)", status: true },
        { id: "3", descricao: "Erro de agendamento", status: true },
        { id: "4", descricao: "Conflito de horário do dentista", status: true },
        { id: "5", descricao: "Clínica fechada / feriado", status: true },
        { id: "6", descricao: "Outros", status: false },
    ]);

    // Sem tela de referência para esta aba — dados de exemplo até você confirmar
    // com o time o que faz sentido aparecer aqui por padrão.
    const [origemPaciente, setOrigemPaciente] = useState<EntityRecord[]>([
        { id: "1", descricao: "Indicação de paciente", status: true },
        { id: "2", descricao: "Instagram", status: true },
        { id: "3", descricao: "Google", status: true },
        { id: "4", descricao: "Convênio", status: true },
    ]);

    return (
        <Tabs.Root value={subTab} onValueChange={setSubTab}>
            <SectionCard
                subTabs={
                    <SubTabList>
                        <SubTabTrigger value="motivos-cancelamento">Motivos de Cancelamento</SubTabTrigger>
                        <SubTabTrigger value="origem-paciente">Origem do Paciente</SubTabTrigger>
                    </SubTabList>
                }
            >
                <Tabs.Content value="motivos-cancelamento">
                    <EntityListSection
                        title="Motivos de Cancelamento"
                        subtitle="Motivos disponíveis ao cancelar um agendamento"
                        addLabel="Novo motivo"
                        addBottomLabel="+ Adicionar novo motivo de cancelamento"
                        dialogTitleCreate="Novo motivo"
                        dialogTitleEdit="Editar motivo"
                        submitCreateLabel="Salvar"
                        columns={[
                            { key: "descricao", label: "Descrição" },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={motivosCancelamento}
                        setItems={setMotivosCancelamento}
                        fields={[
                            {
                                key: "descricao",
                                label: "Descrição",
                                type: "text",
                                required: true,
                                placeholder: "Ex: Paciente desmarcou",
                            },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção em novos cancelamentos" },
                        ]}
                        createDefaults={{ descricao: "", status: true }}
                    />
                </Tabs.Content>

                <Tabs.Content value="origem-paciente">
                    <EntityListSection
                        title="Origem do Paciente"
                        subtitle="De onde os pacientes conhecem a clínica"
                        addLabel="Nova Origem"
                        addBottomLabel="+ Adicionar nova origem do paciente"
                        dialogTitleCreate="Nova Origem"
                        dialogTitleEdit="Editar Origem"
                        submitCreateLabel="Salvar"
                        columns={[
                            { key: "descricao", label: "Descrição" },
                            { key: "status", label: "Status", render: (i) => <StatusBadge active={!!i.status} /> },
                        ]}
                        items={origemPaciente}
                        setItems={setOrigemPaciente}
                        fields={[
                            { key: "descricao", label: "Descrição", type: "text", required: true, placeholder: "Ex: Instagram" },
                            { key: "status", label: "Ativo", type: "switch", hint: "Disponível para seleção no cadastro de pacientes" },
                        ]}
                        createDefaults={{ descricao: "", status: true }}
                    />
                </Tabs.Content>
            </SectionCard>
        </Tabs.Root>
    );
}

/* ------------------------------------------------------------------ */
/* Página                                                               */
/* ------------------------------------------------------------------ */

type TopTabId = "clinico" | "financeiro" | "sistema" | "atendimento";

const TOP_TABS: { id: TopTabId; label: string }[] = [
    { id: "clinico", label: "Clínico" },
    { id: "financeiro", label: "Financeiro" },
    { id: "sistema", label: "Sistema" },
    { id: "atendimento", label: "Atendimento" },
];

export function AuxiliaresPage() {
    const [topTab, setTopTab] = useState<TopTabId>("clinico");

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-auto px-9 py-7">
                <Tabs.Root value={topTab} onValueChange={(v) => setTopTab(v as TopTabId)}>
                    <Tabs.List className="mb-[22px] flex flex-wrap gap-2">
                        {TOP_TABS.map(({ id, label }) => (
                            <Tabs.Trigger
                                key={id}
                                value={id}
                                className={cn(
                                    "rounded-full border-[1.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-text-secondary)] transition-all",
                                    "hover:border-[var(--gray-300)] hover:text-[var(--gray-700)]",
                                    "data-[state=active]:border-[var(--blue)] data-[state=active]:bg-[var(--blue)] data-[state=active]:text-[var(--white)] data-[state=active]:shadow-[0_6px_16px_rgba(79,126,247,0.3)]",
                                )}
                            >
                                {label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <Tabs.Content value="clinico">
                        <ClinicoTab />
                    </Tabs.Content>
                    <Tabs.Content value="financeiro">
                        <FinanceiroTab />
                    </Tabs.Content>
                    <Tabs.Content value="sistema">
                        <SistemaTab />
                    </Tabs.Content>
                    <Tabs.Content value="atendimento">
                        <AtendimentoTab />
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        </div>
    );
}
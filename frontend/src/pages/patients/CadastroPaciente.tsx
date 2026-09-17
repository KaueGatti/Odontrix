import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { maskCEP, maskCPF, maskRG, maskTelefone } from "@/lib/masks";
import { withMask } from "@/lib/mask-register";
import {
    cadastroPacienteSchema,
    type CadastroPacienteFormInput,
    type CadastroPacienteFormValues,
} from "@/lib/validations/cadastro-paciente.schema.ts";
import { REFERRAL_TYPES, requiresReferrerFor } from "@/lib/referral-types";

const STEPS = [
    { id: "dados-pessoais", label: "Dados Pessoais" },
    { id: "contato", label: "Contato" },
    { id: "endereco", label: "Endereço" },
] as const;

// TODO: substituir pela lista real vinda da API (tabela referral_source)
const REFERRAL_SOURCES = [
    { id: "1", description: "Indicação de paciente" },
    { id: "2", description: "Instagram" },
    { id: "3", description: "Google" },
    { id: "4", description: "Convênio / Plano odontológico" },
    { id: "5", description: "Outro" },
];

export default function CadastroPacientePage() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const isClickScrolling = useRef(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CadastroPacienteFormInput, unknown, CadastroPacienteFormValues>({
        resolver: zodResolver(cadastroPacienteSchema),
        defaultValues: { country: "Brasil", hasResponsible: false },
    });

    const hasResponsible = watch("hasResponsible");
    const referralTypeId = watch("referralTypeId");
    const requiresReferrer = requiresReferrerFor(referralTypeId);

    // Ao trocar para um tipo de indicação que não exige identificar quem
    // indicou, limpa o nome para não persistir um dado órfão.
    const handleReferralTypeChange = (value: string) => {
        if (!requiresReferrerFor(value)) {
            setValue("referredByName", "");
        }
    };

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isClickScrolling.current) return;
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) {
                    setActiveStep(visible[0].target.id);
                }
            },
            {
                root: scrollEl,
                threshold: [0.2, 0.5, 0.8],
                rootMargin: "-10% 0px -55% 0px",
            },
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToStep = (id: string) => {
        const el = sectionRefs.current[id];
        if (!el) return;

        isClickScrolling.current = true;
        setActiveStep(id);
        el.scrollIntoView({ behavior: "smooth", block: "start" });

        window.setTimeout(() => {
            isClickScrolling.current = false;
        }, 600);
    };

    const onSubmit = async (data: CadastroPacienteFormValues) => {
        // TODO: integrar com o endpoint real de cadastro de paciente
        console.log(data);
        navigate("..");
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
                    Cadastros
                </p>
                <h1 className="mb-5 text-[22px] font-bold tracking-tight text-foreground">
                    Cadastro de Paciente
                </h1>

                <div className="mx-auto flex max-w-2xl items-center">
                    {STEPS.map((step, index) => {
                        const isActive = step.id === activeStep;
                        const isPast =
                            STEPS.findIndex((s) => s.id === activeStep) > index;
                        return (
                            <div
                                key={step.id}
                                className="flex flex-1 items-center last:flex-none"
                            >
                                <button
                                    type="button"
                                    onClick={() => scrollToStep(step.id)}
                                    className="flex flex-col items-center gap-2"
                                >
                  <span
                      className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          isActive || isPast
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                      )}
                  >
                    {isPast ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                                    <span
                                        className={cn(
                                            "whitespace-nowrap text-[11.5px] font-medium",
                                            isActive ? "text-foreground" : "text-muted-foreground",
                                        )}
                                    >
                    {step.label}
                  </span>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "mx-3 h-[2px] flex-1 rounded-full transition-colors",
                                            isPast ? "bg-primary" : "bg-border",
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-9 py-7">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="mx-auto flex max-w-2xl flex-col gap-6 pb-4"
                >
                    <section
                        id="dados-pessoais"
                        ref={(el) => {
                            sectionRefs.current["dados-pessoais"] = el;
                        }}
                        className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                    >
                        <h2 className="mb-4 text-sm font-bold text-foreground">
                            Dados Pessoais
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="fullName" className="mb-1.5 block">
                                    Nome <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Nome completo"
                                    aria-invalid={!!errors.fullName}
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cpf" className="mb-1.5 block">
                                        CPF
                                    </Label>
                                    <Input
                                        id="cpf"
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        aria-invalid={!!errors.cpf}
                                        {...withMask(register("cpf"), maskCPF)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rg" className="mb-1.5 block">
                                        RG
                                    </Label>
                                    <Input id="rg" placeholder="00.000.000-0" {...withMask(register("rg"), maskRG)} />
                                </div>
                            </div>
                            {errors.cpf && (
                                <p className="-mt-2 text-xs text-destructive">
                                    {errors.cpf.message}
                                </p>
                            )}

                            <div>
                                <Label htmlFor="birthDate" className="mb-1.5 block">
                                    Data de Nascimento <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    aria-invalid={!!errors.birthDate}
                                    {...register("birthDate")}
                                />
                                {errors.birthDate && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.birthDate.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        id="contato"
                        ref={(el) => {
                            sectionRefs.current["contato"] = el;
                        }}
                        className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                    >
                        <h2 className="mb-4 text-sm font-bold text-foreground">
                            Contato
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="landlinePhone" className="mb-1.5 block">
                                        Telefone Fixo <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="landlinePhone"
                                        placeholder="(00) 0000-0000"
                                        inputMode="numeric"
                                        aria-invalid={!!errors.landlinePhone}
                                        {...withMask(register("landlinePhone"), maskTelefone)}
                                    />
                                    {errors.landlinePhone && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.landlinePhone.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="cellPhone" className="mb-1.5 block">
                                        Celular <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="cellPhone"
                                        placeholder="(00) 00000-0000"
                                        inputMode="numeric"
                                        aria-invalid={!!errors.cellPhone}
                                        {...withMask(register("cellPhone"), maskTelefone)}
                                    />
                                    {errors.cellPhone && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.cellPhone.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="emergencyPhone" className="mb-1.5 block">
                                        Telefone p/ Emergência{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="emergencyPhone"
                                        placeholder="(00) 00000-0000"
                                        inputMode="numeric"
                                        aria-invalid={!!errors.emergencyPhone}
                                        {...withMask(register("emergencyPhone"), maskTelefone)}
                                    />
                                    {errors.emergencyPhone && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.emergencyPhone.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="mb-1.5 block">
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nome@email.com"
                                    aria-invalid={!!errors.email}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        id="endereco"
                        ref={(el) => {
                            sectionRefs.current["endereco"] = el;
                        }}
                        className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                    >
                        <h2 className="mb-4 text-sm font-bold text-foreground">
                            Endereço
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cep" className="mb-1.5 block">
                                        CEP <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="cep"
                                        placeholder="00000-000"
                                        inputMode="numeric"
                                        aria-invalid={!!errors.cep}
                                        {...withMask(register("cep"), maskCEP)}
                                    />
                                    {errors.cep && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.cep.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="country" className="mb-1.5 block">
                                        País <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="country"
                                        aria-invalid={!!errors.country}
                                        {...register("country")}
                                    />
                                    {errors.country && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.country.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="state" className="mb-1.5 block">
                                        UF <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="state"
                                        placeholder="SP"
                                        maxLength={2}
                                        aria-invalid={!!errors.state}
                                        {...register("state")}
                                    />
                                    {errors.state && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.state.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city" className="mb-1.5 block">
                                        Cidade <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        aria-invalid={!!errors.city}
                                        {...register("city")}
                                    />
                                    {errors.city && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="neighborhood" className="mb-1.5 block">
                                        Bairro <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="neighborhood"
                                        aria-invalid={!!errors.neighborhood}
                                        {...register("neighborhood")}
                                    />
                                    {errors.neighborhood && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.neighborhood.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="street" className="mb-1.5 block">
                                        Rua <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="street"
                                        aria-invalid={!!errors.street}
                                        {...register("street")}
                                    />
                                    {errors.street && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.street.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="number" className="mb-1.5 block">
                                        Número <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="number"
                                        aria-invalid={!!errors.number}
                                        {...register("number")}
                                    />
                                    {errors.number && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.number.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="complement" className="mb-1.5 block">
                                    Complemento
                                </Label>
                                <Input id="complement" {...register("complement")} />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-bold text-foreground">
                            Outras informações
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="referralSourceId" className="mb-1.5 block">
                                    Como nos conheceu? <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    id="referralSourceId"
                                    defaultValue=""
                                    aria-invalid={!!errors.referralSourceId}
                                    {...register("referralSourceId")}
                                >
                                    <option value="" disabled>
                                        Selecione uma opção...
                                    </option>
                                    {REFERRAL_SOURCES.map((source) => (
                                        <option key={source.id} value={source.id}>
                                            {source.description}
                                        </option>
                                    ))}
                                </Select>
                                {errors.referralSourceId && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.referralSourceId.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="referralTypeId" className="mb-1.5 block">
                                    Tipo de indicação
                                </Label>
                                <Select
                                    id="referralTypeId"
                                    defaultValue=""
                                    {...register("referralTypeId", {
                                        onChange: (event) =>
                                            handleReferralTypeChange(event.target.value),
                                    })}
                                >
                                    <option value="">Não informado</option>
                                    {REFERRAL_TYPES.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.description}
                                        </option>
                                    ))}
                                </Select>
                                <p className="mt-1.5 text-[12px] text-muted-foreground">
                                    Quem indicou o paciente — o tipo “Outro” não exige o nome.
                                </p>
                            </div>

                            {requiresReferrer && (
                                <div>
                                    <Label htmlFor="referredByName" className="mb-1.5 block">
                                        Quem indicou? <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="referredByName"
                                        placeholder="Ex: Ana Costa, Dr. Eduardo Ramalho"
                                        aria-invalid={!!errors.referredByName}
                                        {...register("referredByName")}
                                    />
                                    {errors.referredByName && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.referredByName.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            <label className="flex items-center gap-2.5 text-[13px] text-foreground">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-input accent-primary"
                                    {...register("hasResponsible")}
                                />
                                Paciente é menor de idade ou incapaz
                            </label>

                            {hasResponsible && (
                                <div className="rounded-md border border-border bg-muted/40 p-4">
                                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                                        Responsável
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <Label
                                                htmlFor="responsibleFullName"
                                                className="mb-1.5 block"
                                            >
                                                Nome <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="responsibleFullName"
                                                aria-invalid={!!errors.responsibleFullName}
                                                {...register("responsibleFullName")}
                                            />
                                            {errors.responsibleFullName && (
                                                <p className="mt-1.5 text-xs text-destructive">
                                                    {errors.responsibleFullName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="responsibleCpf" className="mb-1.5 block">
                                                    CPF
                                                </Label>
                                                <Input
                                                    id="responsibleCpf"
                                                    placeholder="000.000.000-00"
                                                    inputMode="numeric"
                                                    {...withMask(register("responsibleCpf"), maskCPF)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="responsibleRg" className="mb-1.5 block">
                                                    RG
                                                </Label>
                                                <Input
                                                    id="responsibleRg"
                                                    placeholder="00.000.000-0"
                                                    {...withMask(register("responsibleRg"), maskRG)}
                                                />
                                            </div>
                                        </div>
                                        {errors.responsibleCpf && (
                                            <p className="-mt-2 text-xs text-destructive">
                                                {errors.responsibleCpf.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("..")}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
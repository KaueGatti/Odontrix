import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { maskCPF, maskCNPJ, maskRG, maskTelefone } from "@/lib/masks";
import { withMask } from "@/lib/mask-register";
import {
  cadastroDentistaSchema,
  type CadastroDentistaFormInput,
  type CadastroDentistaFormValues,
} from "@/lib/validations/cadastro-dentista.schema.ts";

const STEPS = [
  { id: "identificacao", label: "Identificação" },
  { id: "documentos", label: "Documentos & CRO" },
  { id: "contato", label: "Contato" },
  { id: "acesso", label: "Acesso" },
] as const;

const CRO_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function CadastroDentistaPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isClickScrolling = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroDentistaFormInput, unknown, CadastroDentistaFormValues>({
    resolver: zodResolver(cadastroDentistaSchema),
    defaultValues: { personType: "natural_person" },
  });

  const personType = watch("personType");

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

  const onSubmit = async (data: CadastroDentistaFormValues) => {
    // TODO: integrar com o endpoint real de cadastro de dentista
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
          Cadastro de Dentista
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
          {/* STEP 1 - IDENTIFICAÇÃO */}
          <section
            id="identificacao"
            ref={(el) => {
              sectionRefs.current["identificacao"] = el;
            }}
            className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-bold text-foreground">
              Identificação
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
                  <Label htmlFor="birthDate" className="mb-1.5 block">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register("birthDate")}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">
                    Tipo de Pessoa <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value="natural_person"
                        {...register("personType")}
                        className="text-primary"
                      />
                      Pessoa Física
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value="legal_entity"
                        {...register("personType")}
                        className="text-primary"
                      />
                      Pessoa Jurídica
                    </label>
                  </div>
                  {errors.personType && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.personType.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2 - DOCUMENTOS & CRO */}
          <section
            id="documentos"
            ref={(el) => {
              sectionRefs.current["documentos"] = el;
            }}
            className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-bold text-foreground">
              Documentos & CRO
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
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
                  <Input
                    id="rg"
                    placeholder="00.000.000-0"
                    {...withMask(register("rg"), maskRG)}
                  />
                </div>
                {personType === "legal_entity" && (
                  <div>
                    <Label htmlFor="cnpj" className="mb-1.5 block">
                      CNPJ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      inputMode="numeric"
                      aria-invalid={!!errors.cnpj}
                      {...withMask(register("cnpj"), maskCNPJ)}
                    />
                    {errors.cnpj && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.cnpj.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {errors.cpf && (
                <p className="-mt-2 text-xs text-destructive">
                  {errors.cpf.message}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="croState" className="mb-1.5 block">
                    UF do CRO <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="croState"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!errors.croState}
                    {...register("croState")}
                  >
                    <option value="">Selecione...</option>
                    {CRO_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  {errors.croState && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.croState.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="croNumber" className="mb-1.5 block">
                    Número do CRO <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="croNumber"
                    placeholder="Número do registro"
                    aria-invalid={!!errors.croNumber}
                    {...register("croNumber")}
                  />
                  {errors.croNumber && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.croNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentPrice" className="mb-1.5 block">
                    Preço por Consulta
                  </Label>
                  <Input
                    id="appointmentPrice"
                    placeholder="R$ 0,00"
                    {...register("appointmentPrice")}
                  />
                </div>
                <div>
                  <Label htmlFor="commissionPercent" className="mb-1.5 block">
                    Comissão (%)
                  </Label>
                  <Input
                    id="commissionPercent"
                    placeholder="0,00%"
                    {...register("commissionPercent")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3 - CONTATO */}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="mb-1.5 block">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                    aria-invalid={!!errors.phone}
                    {...withMask(register("phone"), maskTelefone)}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
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
            </div>
          </section>

          {/* STEP 4 - ACESSO */}
          <section
            id="acesso"
            ref={(el) => {
              sectionRefs.current["acesso"] = el;
            }}
            className="scroll-mt-4 rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-bold text-foreground">
              Acesso
            </h2>
            <p className="mb-4 text-[12.5px] text-muted-foreground">
              Crie as credenciais de login para o dentista acessar o sistema.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="username" className="mb-1.5 block">
                  Nome de Usuário <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="usuario.acesso"
                  aria-invalid={!!errors.username}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="loginEmail" className="mb-1.5 block">
                  E-mail de Login <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="usuario@clinica.com"
                  aria-invalid={!!errors.loginEmail}
                  {...register("loginEmail")}
                />
                {errors.loginEmail && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.loginEmail.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="mb-1.5 block">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="mb-1.5 block">
                    Confirmar Senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
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

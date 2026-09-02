import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoneyFromCents, maskCPF, maskCNPJ, maskMoney, maskPercent, maskRG, maskTelefone } from "@/lib/masks";
import { withMask } from "@/lib/mask-register";
import type { Dentist } from "@/types/dentist";
import {
  cadastroDentistaSchema,
  type CadastroDentistaFormInput,
  type CadastroDentistaFormValues,
} from "@/lib/validations/cadastro-dentista.schema.ts";

const CRO_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface DadosCadastraisTabProps {
  dentist: Dentist;
}

export function DadosCadastraisTab({ dentist }: DadosCadastraisTabProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroDentistaFormInput, unknown, CadastroDentistaFormValues>({
    resolver: zodResolver(cadastroDentistaSchema),
    defaultValues: {
      fullName: dentist.fullName,
      cpf: dentist.cpf ?? "",
      rg: dentist.rg ?? "",
      cnpj: dentist.cnpj ?? "",
      croNumber: dentist.croNumber,
      croState: dentist.croState,
      birthDate: dentist.birthDate ?? "",
      phone: dentist.phone,
      email: dentist.email ?? "",
      appointmentPrice:
        dentist.appointmentPrice != null
          ? formatMoneyFromCents(Math.round(dentist.appointmentPrice * 100), false)
          : "",
      commissionPercent:
        dentist.commissionPercent != null
          ? formatMoneyFromCents(Math.round(dentist.commissionPercent * 100), false)
          : "",
      personType: dentist.personType,
      username: dentist.access.username,
      loginEmail: dentist.access.email,
      password: "",
      confirmPassword: "",
    },
  });

  const personType = watch("personType");

  const onSubmit = async (data: CadastroDentistaFormValues) => {
    // TODO: integrar com o endpoint real de atualização de dentista
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto flex flex-col gap-4 px-9 py-7"
    >
      <Card>
        <CardHeader className="flex gap-4 items-center justify-between">
          <CardTitle className="text-primary">Dentista</CardTitle>
          <div className="rounded-[var(--border-radius-sm)] border border-[var(--red)]/20 bg-[var(--red)]/[0.07] px-3 py-2 text-[11px] text-[var(--red)]">
            Campos marcados com <span className="font-semibold">*</span> são obrigatórios
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <Label htmlFor="fullName" className="mb-1.5 block">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
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
            </div>
            <div className="mt-3">
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
          </section>

          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Documentos
            </p>
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
              <p className="mt-1.5 text-xs text-destructive">{errors.cpf.message}</p>
            )}
          </section>

          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Registro Profissional
            </p>
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
          </section>

          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Contato
            </p>
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
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
            </div>
          </section>

          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Valores
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentPrice" className="mb-1.5 block">
                  Preço por Consulta
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="appointmentPrice"
                    placeholder="0,00"
                    inputMode="decimal"
                    className="pl-7"
                    {...withMask(register("appointmentPrice"), (v) => maskMoney(v, false))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="commissionPercent" className="mb-1.5 block">
                  Comissão (%)
                </Label>
                <Input
                  id="commissionPercent"
                  placeholder="0,00"
                  inputMode="decimal"
                  {...withMask(register("commissionPercent"), maskPercent)}
                />
              </div>
            </div>
          </section>

          <section>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Dados de Acesso
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Nome de Usuário</Label>
                <div className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                  {dentist.access.username}
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">E-mail de Login</Label>
                <div className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                  {dentist.access.email}
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-9 -mb-7 mt-2 border-t border-border bg-background/95 px-9 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Check className="h-4 w-4" />
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </form>
  );
}

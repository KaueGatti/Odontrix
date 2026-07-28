import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { maskCPF, maskRG, maskTelefone } from "@/lib/masks";
import { withMask } from "@/lib/mask-register";
import type { Receptionist } from "@/types/receptionist";
import {
  cadastroRecepcionistaSchema,
  type CadastroRecepcionistaFormInput,
  type CadastroRecepcionistaFormValues,
} from "@/lib/validations/cadastro-recepcionista.schema.ts";

function formatDate(iso: string) {
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("pt-BR");
}

interface DadosCadastraisTabProps {
  receptionist: Receptionist;
}

export function DadosCadastraisTab({ receptionist }: DadosCadastraisTabProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroRecepcionistaFormInput, unknown, CadastroRecepcionistaFormValues>({
    resolver: zodResolver(cadastroRecepcionistaSchema),
    defaultValues: {
      fullName: receptionist.fullName,
      cpf: receptionist.cpf ?? "",
      rg: receptionist.rg ?? "",
      birthDate: receptionist.birthDate ?? "",
      hireDate: receptionist.hireDate,
      phone: receptionist.phone,
      email: receptionist.email ?? "",
      username: receptionist.access.username,
      loginEmail: receptionist.access.email,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: CadastroRecepcionistaFormValues) => {
    // TODO: integrar com o endpoint real de atualização de recepcionista
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
          <CardTitle className="text-primary">Recepcionista</CardTitle>
          <div className="rounded-[var(--border-radius-sm)] border border-[var(--red)]/20 bg-[var(--red)]/[0.07] px-3 py-2 text-[11px] text-[var(--red)]">
            Campos marcados com <span className="font-semibold">*</span> são obrigatórios
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <section>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
              <div>
                <Label className="mb-1.5 block">Data de Cadastro</Label>
                <div className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                  {formatDate(receptionist.createdAt)}
                </div>
              </div>
            </div>
            {errors.cpf && (
              <p className="mt-1.5 text-xs text-destructive">{errors.cpf.message}</p>
            )}
            <div className="grid grid-cols-2 mt-3 gap-4 w-1/2">
              <div>
                <Label htmlFor="birthDate" className="mb-1.5 block">
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  aria-invalid={!!errors.birthDate}
                  {...register("birthDate")}
                />
              </div>
              <div>
                <Label htmlFor="hireDate" className="mb-1.5 block">
                  Data de Admissão <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  aria-invalid={!!errors.hireDate}
                  {...register("hireDate")}
                />
                {errors.hireDate && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.hireDate.message}
                  </p>
                )}
              </div>
            </div>
            {errors.cpf && (
              <p className="mt-1.5 text-xs text-destructive">{errors.cpf.message}</p>
            )}
          </section>

          <section>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
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
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-primary">
              Dados de Acesso
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Nome de Usuário</Label>
                <div className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                  {receptionist.access.username}
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">E-mail de Login</Label>
                <div className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                  {receptionist.access.email}
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

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { maskCPF, maskRG, maskTelefone } from "@/lib/masks";
import { withMask } from "@/lib/mask-register";
import {
  cadastroPacienteRapidoSchema,
  type CadastroPacienteRapidoFormInput,
  type CadastroPacienteRapidoFormValues,
} from "@/lib/validations/cadastro-paciente-rapido.schema";
import type { MockPatientInput } from "@/pages/patients/mock-data";

interface NovoPacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Nome digitado no combobox de paciente do agendamento — pré-preenche o
   * campo Nome para não obrigar a digitar tudo de novo.
   */
  initialFullName?: string;
  onSave: (payload: MockPatientInput) => void;
}

/**
 * Cadastro rápido de paciente, aberto pela opção "+ <nome digitado>" do
 * combobox de paciente em `NovaConsultaDialog`. Coleta apenas nome, celular e,
 * quando o paciente é menor de idade/incapaz, o responsável — os demais campos
 * ficam pendentes até completar o cadastro na ficha do paciente.
 */
export function NovoPacienteDialog({
  open,
  onOpenChange,
  initialFullName,
  onSave,
}: NovoPacienteDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<
    CadastroPacienteRapidoFormInput,
    unknown,
    CadastroPacienteRapidoFormValues
  >({
    resolver: zodResolver(cadastroPacienteRapidoSchema),
    defaultValues: { isMinor: false },
  });

  const isMinor = watch("isMinor");

  useEffect(() => {
    if (!open) return;
    reset({
      fullName: initialFullName ?? "",
      cellPhone: "",
      isMinor: false,
      responsibleFullName: "",
      responsibleCpf: "",
      responsibleRg: "",
    });
  }, [open, initialFullName, reset]);

  const onSubmit = (data: CadastroPacienteRapidoFormValues) => {
    onSave({
      fullName: data.fullName.trim(),
      cellPhone: data.cellPhone.trim(),
      isMinor: data.isMinor,
      responsible: data.isMinor
        ? {
            fullName: (data.responsibleFullName ?? "").trim(),
            cpf: data.responsibleCpf || undefined,
            rg: data.responsibleRg || undefined,
          }
        : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">
            Cadastro rápido de paciente
          </DialogTitle>
          <DialogDescription>
            Cadastre o paciente sem sair do agendamento — os demais dados podem
            ser completados depois na ficha.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3.5"
        >
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(79,126,247,0.18)] bg-[rgba(79,126,247,0.07)] px-3.5 py-2.5 text-[11.5px] font-medium text-primary">
            <Info className="h-4 w-4 shrink-0" />
            CPF/RG, data de nascimento, endereço e demais dados ficam pendentes
            até completar o cadastro.
          </div>

          <div className="space-y-[6px]">
            <Label
              htmlFor="quick-patient-name"
              className="text-[12.5px] font-medium text-[var(--gray-700)]"
            >
              Nome completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-patient-name"
              placeholder="Ex: Maria Eduarda Souza"
              aria-invalid={!!errors.fullName}
              className="h-10 rounded-[10px] text-[13px]"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-[6px]">
            <Label
              htmlFor="quick-patient-cell"
              className="text-[12.5px] font-medium text-[var(--gray-700)]"
            >
              Celular <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-patient-cell"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              aria-invalid={!!errors.cellPhone}
              className="h-10 rounded-[10px] text-[13px]"
              {...withMask(register("cellPhone"), maskTelefone)}
            />
            {errors.cellPhone && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.cellPhone.message}
              </p>
            )}
          </div>
<label className="flex items-center gap-2.5 text-[13px] text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              {...register("isMinor")}
            />
            Paciente é menor de idade ou incapaz
          </label>

          {isMinor && (
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                Responsável
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <Label
                    htmlFor="quick-patient-responsible"
                    className="mb-1.5 block"
                  >
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quick-patient-responsible"
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
                    <Label
                      htmlFor="quick-patient-responsible-cpf"
                      className="mb-1.5 block"
                    >
                      CPF
                    </Label>
                    <Input
                      id="quick-patient-responsible-cpf"
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      {...withMask(register("responsibleCpf"), maskCPF)}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="quick-patient-responsible-rg"
                      className="mb-1.5 block"
                    >
                      RG
                    </Label>
                    <Input
                      id="quick-patient-responsible-rg"
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

          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Check className="h-3.5 w-3.5" />
              Cadastrar paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
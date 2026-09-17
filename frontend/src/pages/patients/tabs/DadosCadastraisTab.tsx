import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Check} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {maskCEP, maskCPF, maskRG, maskTelefone} from "@/lib/masks";
import {withMask} from "@/lib/mask-register";
import type {Patient} from "@/types/patient";
import {
    cadastroPacienteSchema,
    type CadastroPacienteFormInput,
    type CadastroPacienteFormValues,
} from "@/lib/validations/cadastro-paciente.schema.ts";
import {REFERRAL_TYPES, requiresReferrerFor} from "@/lib/referral-types";

// TODO: substituir pela lista real vinda da API (tabela referral_source)
const REFERRAL_SOURCES = [
    {id: "1", description: "Indicação de paciente"},
    {id: "2", description: "Instagram"},
    {id: "3", description: "Google"},
    {id: "4", description: "Convênio / Plano odontológico"},
    {id: "5", description: "Outro"},
];

function formatDate(iso: string) {
    return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("pt-BR");
}

interface DadosCadastraisTabProps {
    patient: Patient;
}

export function DadosCadastraisTab({patient}: DadosCadastraisTabProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors, isSubmitting},
    } = useForm<CadastroPacienteFormInput, unknown, CadastroPacienteFormValues>({
        resolver: zodResolver(cadastroPacienteSchema),
        defaultValues: {
            fullName: patient.fullName,
            cpf: patient.cpf ?? "",
            rg: patient.rg ?? "",
            birthDate: patient.birthDate,
            landlinePhone: patient.landlinePhone,
            cellPhone: patient.cellPhone,
            emergencyPhone: patient.emergencyPhone,
            email: patient.email ?? "",
            cep: patient.address.cep,
            country: patient.address.country,
            state: patient.address.state,
            city: patient.address.city,
            neighborhood: patient.address.neighborhood,
            street: patient.address.street,
            number: patient.address.number,
            complement: patient.address.complement ?? "",
            referralSourceId: String(patient.referralSource.id),
            referralTypeId: patient.referralType ? String(patient.referralType.id) : "",
            referredByName: patient.referredByName ?? "",
            hasResponsible: !!patient.responsible,
            responsibleFullName: patient.responsible?.fullName ?? "",
            responsibleCpf: patient.responsible?.cpf ?? "",
            responsibleRg: patient.responsible?.rg ?? "",
        },
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

    const onSubmit = async (data: CadastroPacienteFormValues) => {
        // TODO: integrar com o endpoint real de atualização de paciente
        console.log(data);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className=" flex flex-col gap-4 px-6 py-4"
        >
            <Card>
                <CardHeader className="flex gap-4 items-center justify-between">
                    <CardTitle className="text-primary">Paciente</CardTitle>
                    <div
                        className="rounded-[var(--border-radius-sm)] border border-[var(--red)]/20 bg-[var(--red)]/[0.07] px-3 py-2 text-[11px] text-[var(--red)]">
                        Campos marcados com <span className="font-semibold">*</span> são obrigatórios
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    {/* Identificação — Nome + Nascimento + CPF + RG + Data de Cadastro numa única linha */}
                    <section>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Identificação
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
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
                                    Data de Nascimento <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    className="flex justify-center"
                                    id="birthDate"
                                    type="date"
                                    aria-invalid={!!errors.birthDate}
                                    {...register("birthDate")}
                                />
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
                                <div
                                    className="flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                                    {formatDate(patient.createdAt)}
                                </div>
                            </div>
                        </div>
                        {errors.cpf && (
                            <p className="mt-1.5 text-xs text-destructive">{errors.cpf.message}</p>
                        )}
                    </section>

                    {/* Contato + Endereço lado a lado — reduz a altura total ocupando a largura do card */}
                    <section className="flex flex-col justify-around">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Contato
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            </div>
                            <div>
                                <Label htmlFor="emergencyPhone" className="mb-1.5 block">
                                    Telefone p/ Emergência <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="emergencyPhone"
                                    placeholder="(00) 00000-0000"
                                    inputMode="numeric"
                                    aria-invalid={!!errors.emergencyPhone}
                                    {...withMask(register("emergencyPhone"), maskTelefone)}
                                />
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
                        {errors.landlinePhone ||
                        errors.cellPhone ||
                        errors.emergencyPhone ||
                        errors.email ? (
                            <p className="mt-1.5 text-xs text-destructive">
                                {errors.landlinePhone?.message ||
                                    errors.cellPhone?.message ||
                                    errors.emergencyPhone?.message ||
                                    errors.email?.message}
                            </p>
                        ) : null}
                    </section>

                    <section>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Endereço
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            </div>
                            <div>
                                <Label htmlFor="state" className="mb-1.5 block">
                                    UF <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="state"
                                    maxLength={2}
                                    aria-invalid={!!errors.state}
                                    {...register("state")}
                                />
                            </div>
                            <div>
                                <Label htmlFor="city" className="mb-1.5 block">
                                    Cidade <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    aria-invalid={!!errors.city}
                                    {...register("city")}
                                />
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
                            </div>
                            <div>
                                <Label htmlFor="street" className="mb-1.5 block">
                                    Rua <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="street"
                                    aria-invalid={!!errors.street}
                                    {...register("street")}
                                />
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
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="complement" className="mb-1.5 block">
                                    Complemento
                                </Label>
                                <Input id="complement" {...register("complement")} />
                            </div>
                        </div>
                        {errors.city && (
                            <p className="mt-1.5 text-xs text-destructive">{errors.city.message}</p>
                        )}
                    </section>

                    {/* Origem do paciente + responsável na mesma linha */}
                    <div className="flex flex-col">

                        <Label htmlFor="referralSourceId" className="mb-1.5 block">
                            Como nos conheceu? <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            id="referralSourceId"
                            className="max-w-xs"
                            aria-invalid={!!errors.referralSourceId}
                            {...register("referralSourceId")}
                        >
{REFERRAL_SOURCES.map((source) => (
                            <option key={source.id} value={source.id}>
                                {source.description}
                            </option>
                        ))}
                        </Select>
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="referralTypeId" className="mb-1.5 block">
                            Tipo de indicação
                        </Label>
                        <Select
                            id="referralTypeId"
                            className="max-w-xs"
                            {...register("referralTypeId", {
                                onChange: (event) => handleReferralTypeChange(event.target.value),
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
                        <div className="flex flex-col">
                            <Label htmlFor="referredByName" className="mb-1.5 block">
                                Quem indicou? <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="referredByName"
                                className="max-w-xs"
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
                    <label className="flex items-center gap-2.5 pb-2.5 text-[13px] text-foreground">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-input accent-primary"
                            {...register("hasResponsible")}
                        />
                        Paciente é menor de idade ou incapaz
                    </label>
                    {hasResponsible && (
                        <div className="rounded-b-lg border-t border-border">
                            <div
                                className="bg-destructive px-5 py-2 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                                Obrigatório para pacientes menores de idade ou incapazes
                            </div>
                            <div className="p-5">
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-primary">
                                    Responsável
                                </p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.responsibleCpf.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/*
        Rodapé fixo: como esta tab é renderizada dentro do wrapper com
        overflow-auto de PacienteDetalhesPage (não cria um scroll próprio),
        "sticky bottom-0" gruda no fundo desse ancestral com scroll — o
        botão fica sempre visível enquanto os campos acima rolam por trás.
        -mx-9/px-9 sangra a barra para as bordas do container, já que o
        <form> tem padding horizontal (px-9) aplicado no elemento pai.
      */}
            <div
                className="sticky bottom-0 z-10 -mx-6 -mb-7 mt-2 border-t border-border bg-background/95 px-9 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        <Check className="h-4 w-4"/>
                        {isSubmitting ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

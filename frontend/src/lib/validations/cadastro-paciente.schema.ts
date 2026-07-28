import { z } from "zod";

export const cadastroPacienteSchema = z
    .object({
        // ---- Dados pessoais ----
        fullName: z.string().min(1, "Informe o nome completo"),
        cpf: z.string().optional().or(z.literal("")),
        rg: z.string().optional().or(z.literal("")),
        birthDate: z.string().min(1, "Informe a data de nascimento"),

        // ---- Contato ----
        landlinePhone: z.string().min(1, "Informe o telefone fixo"),
        cellPhone: z.string().min(1, "Informe o celular"),
        emergencyPhone: z.string().min(1, "Informe o telefone de emergência"),
        email: z.string().email("E-mail inválido").optional().or(z.literal("")),

        // ---- Endereço ----
        cep: z.string().min(1, "Informe o CEP"),
        country: z.string().min(1, "Informe o país"),
        state: z.string().min(1, "Informe a UF"),
        city: z.string().min(1, "Informe a cidade"),
        neighborhood: z.string().min(1, "Informe o bairro"),
        street: z.string().min(1, "Informe a rua"),
        number: z.string().min(1, "Informe o número"),
        complement: z.string().optional().or(z.literal("")),

        // ---- Outros ----
        referralSourceId: z.string().min(1, "Selecione uma opção"),

        // ---- Responsável (obrigatório apenas se marcado) ----
        hasResponsible: z.boolean().default(false),
        responsibleFullName: z.string().optional().or(z.literal("")),
        responsibleCpf: z.string().optional().or(z.literal("")),
        responsibleRg: z.string().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (!data.cpf && !data.rg) {
            ctx.addIssue({
                code: "custom",
                message: "Informe ao menos o CPF ou o RG",
                path: ["cpf"],
            });
        }

        if (data.hasResponsible) {
            if (!data.responsibleFullName) {
                ctx.addIssue({
                    code: "custom",
                    message: "Informe o nome do responsável",
                    path: ["responsibleFullName"],
                });
            }
            if (!data.responsibleCpf && !data.responsibleRg) {
                ctx.addIssue({
                    code: "custom",
                    message: "Informe ao menos o CPF ou o RG do responsável",
                    path: ["responsibleCpf"],
                });
            }
        }
    });

export type CadastroPacienteFormInput = z.input<typeof cadastroPacienteSchema>;
export type CadastroPacienteFormValues = z.infer<typeof cadastroPacienteSchema>;
import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const cadastroDentistaSchema = z
  .object({
    // Identificação
    fullName: z.string().trim().min(1, "Informe o nome completo"),
    birthDate: z.string().trim().optional().or(z.literal("")),
    personType: z.enum(["natural_person", "legal_entity"], {
      required_error: "Selecione o tipo de pessoa",
    }),

    // Documentos
    cpf: z.string().trim().optional().or(z.literal("")),
    rg: z.string().trim().optional().or(z.literal("")),
    cnpj: z.string().trim().optional().or(z.literal("")),
    croState: z.string().trim().min(1, "Informe a UF do CRO"),
    croNumber: z.string().trim().min(1, "Informe o número do CRO"),
    appointmentPrice: z.string().trim().optional().or(z.literal("")),
    commissionPercent: z.string().trim().optional().or(z.literal("")),

    // Contato
    phone: z.string().trim().min(1, "Informe o telefone"),
    email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),

    // Acesso
    username: z.string().trim().min(1, "Informe o nome de usuário"),
    loginEmail: z.string().trim().min(1, "Informe o e-mail de login").email("E-mail inválido"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .superRefine((data, ctx) => {
    const hasDoc = !!data.cpf || !!data.rg || !!data.cnpj;
    if (!hasDoc) {
      ctx.addIssue({
        code: "custom",
        message: "Informe ao menos um documento (CPF, RG ou CNPJ)",
        path: ["cpf"],
      });
    }

    if (data.personType === "legal_entity" && !data.cnpj) {
      ctx.addIssue({
        code: "custom",
        message: "CNPJ é obrigatório para pessoa jurídica",
        path: ["cnpj"],
      });
    }
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CadastroDentistaFormInput = z.input<typeof cadastroDentistaSchema>;
export type CadastroDentistaFormValues = z.output<typeof cadastroDentistaSchema>;

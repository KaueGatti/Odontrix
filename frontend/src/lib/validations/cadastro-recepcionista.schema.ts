import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const cadastroRecepcionistaSchema = z
  .object({
    // Dados Pessoais
    fullName: z.string().trim().min(1, "Informe o nome completo"),
    cpf: z.string().trim().optional().or(z.literal("")),
    rg: z.string().trim().optional().or(z.literal("")),
    birthDate: z.string().trim().optional().or(z.literal("")),
    hireDate: z.string().trim().min(1, "Informe a data de admissão"),

    // Contato
    phone: z.string().trim().min(1, "Informe o telefone"),
    email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),

    // Acesso — cria o usuário vinculado (tabela users)
    username: z.string().trim().min(1, "Informe o usuário"),
    loginEmail: z.string().trim().min(1, "Informe o e-mail de login").email("E-mail inválido"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => !!data.cpf || !!data.rg, {
    message: "Informe ao menos um documento (CPF ou RG)",
    path: ["cpf"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CadastroRecepcionistaFormInput = z.input<typeof cadastroRecepcionistaSchema>;
export type CadastroRecepcionistaFormValues = z.output<typeof cadastroRecepcionistaSchema>;

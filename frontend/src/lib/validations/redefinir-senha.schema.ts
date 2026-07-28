import { z } from "zod";

export const redefinirSenhaSchema = z
  .object({
    novaSenha: z
      .string()
      //.min(8, "A senha deve ter pelo menos 8 caracteres")
      //.regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
      //.regex(/[0-9]/, "A senha deve conter um número")
      //.regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial"),
      , confirmarSenha: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaFormValues = z.infer<typeof redefinirSenhaSchema>;

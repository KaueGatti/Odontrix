import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Informe seu usuário ou e-mail"),
  senha: z.string().min(1, "Informe sua senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

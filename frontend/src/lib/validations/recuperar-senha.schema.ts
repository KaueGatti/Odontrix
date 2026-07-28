import { z } from "zod";

export const recuperarSenhaSchema = z.object({
  loginOuEmail: z.string().min(1, "Informe seu login ou e-mail"),
});

export type RecuperarSenhaFormValues = z.infer<typeof recuperarSenhaSchema>;

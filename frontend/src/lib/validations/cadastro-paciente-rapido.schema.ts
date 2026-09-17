import { z } from "zod";

/**
 * Schema do cadastro rápido de paciente (usado no fluxo de agendamento).
 *
 * Coleta apenas nome e celular — os demais campos do cadastro completo
 * (CPF/RG, nascimento, endereço, telefone fixo/emergência e origem) ficam
 * para a ficha do paciente. O responsável só é exigido quando o checkbox
 * "menor de idade ou incapaz" está marcado, seguindo a mesma regra do
 * schema completo (`cadastro-paciente.schema.ts`).
 */
export const cadastroPacienteRapidoSchema = z
    .object({
        fullName: z.string().min(1, "Informe o nome completo"),
        cellPhone: z
            .string()
            .min(1, "Informe o celular")
            .refine(
                (value) => value.replace(/\D/g, "").length >= 10,
                "Informe um celular válido (DDD + número)"
            ),

        // ---- Responsável (obrigatório apenas se menor/incapaz) ----
        isMinor: z.boolean().default(false),
        responsibleFullName: z.string().optional().or(z.literal("")),
        responsibleCpf: z.string().optional().or(z.literal("")),
        responsibleRg: z.string().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (!data.isMinor) return;

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
    });

export type CadastroPacienteRapidoFormInput = z.input<
    typeof cadastroPacienteRapidoSchema
>;
export type CadastroPacienteRapidoFormValues = z.infer<
    typeof cadastroPacienteRapidoSchema
>;

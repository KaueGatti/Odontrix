import type { ReferralType } from "@/types/patient";

// TODO: substituir pela lista real vinda da API (tabela referral_type)
export const REFERRAL_TYPES: ReferralType[] = [
    { id: 1, description: "Paciente", requiresReferrer: true },
    { id: 2, description: "Dentista", requiresReferrer: true },
    { id: 3, description: "Médico", requiresReferrer: true },
    { id: 4, description: "Amigo / Familiar", requiresReferrer: true },
    { id: 5, description: "Influenciador / Rede social", requiresReferrer: true },
    { id: 6, description: "Outro", requiresReferrer: false },
];

/**
 * Indica se o tipo de indicação selecionado exige o preenchimento do nome
 * de quem indicou. O `id` do formulário é string (valor do <select>).
 */
export function requiresReferrerFor(referralTypeId?: string | null): boolean {
    if (!referralTypeId) return false;

    return (
        REFERRAL_TYPES.find((type) => String(type.id) === String(referralTypeId))
            ?.requiresReferrer ?? false
    );
}

/** Descrição do tipo de indicação a partir do id (string ou number) */
export function referralTypeDescription(referralTypeId?: string | number | null): string | undefined {
    if (referralTypeId === undefined || referralTypeId === null || referralTypeId === "") {
        return undefined;
    }

    return REFERRAL_TYPES.find((type) => String(type.id) === String(referralTypeId))?.description;
}
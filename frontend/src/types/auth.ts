/**
 * Tipos de autenticação — espelham os DTOs do backend
 * (com.odontrix.dto.UserDto / LoginResult) e a spec api/entities/users.yaml.
 */

export type UserProfile = "manager" | "receptionist" | "dentist";

export interface User {
    id: number;
    username: string;
    email: string;
    profile: UserProfile;
    active: boolean;
    /** true = senha provisória (reset administrativo): troca obrigatória. */
    forcePasswordChange: boolean;
    /** ISO-8601 com offset (ex: "2026-10-04T18:27:48.741902Z"). */
    createdAt: string;
}

export interface LoginResult {
    token: string;
    user: User;
    forcePasswordChange: boolean;
}

export const PROFILE_LABELS: Record<UserProfile, string> = {
    manager: "Gerente",
    receptionist: "Recepcionista",
    dentist: "Dentista",
};

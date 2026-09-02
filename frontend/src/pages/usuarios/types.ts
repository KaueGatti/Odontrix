export type UserProfile = "manager" | "dentist" | "receptionist";
export type UserStatus = "active" | "inactive";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  /** Iniciais exibidas no avatar. */
  initials: string;
  /** Classe de cor do avatar (ex: "bg-primary", "#8b5cf6"). */
  avatarColor: string;
  profile: UserProfile;
  status: UserStatus;
  /** DD/MM/AAAA */
  createdAt: string;
  /** Usuário logado (exibe tag "Você" e bloqueia auto-ações). */
  isSelf?: boolean;
}
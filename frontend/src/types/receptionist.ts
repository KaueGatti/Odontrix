/**
 * Espelha a tabela `receptionist` (+ os campos de `users` relevantes pra
 * tela, já que todo recepcionista tem um usuário de acesso vinculado via
 * `user_id`). Diferente de `Patient`, aqui não há endereço, responsável
 * ou origem — só o que existe de fato no schema.
 */
export interface Receptionist {
  id: number;
  fullName: string;
  cpf?: string | null;
  rg?: string | null;
  phone: string;
  email?: string | null; // e-mail de contato (distinto do e-mail de login)
  birthDate?: string | null; // opcional no schema
  hireDate: string; // ISO date — NOT NULL, default CURRENT_DATE
  active: boolean;
  createdAt: string; // ISO datetime
  access: {
    username: string;
    email: string; // e-mail de login (users.email)
  };
}

/**
 * Máscaras de formatação para inputs controlados.
 * Cada função recebe o valor bruto do input (o que o usuário acabou de
 * digitar/colar) e devolve a string já formatada — pensada pra ser usada
 * dentro de um onChange, então também funciona bem com "apagar" (backspace),
 * já que sempre reconstrói a máscara a partir dos dígitos restantes.
 */

/** Remove tudo que não for dígito. */
function onlyDigits(value: string): string {
    return value.replace(/\D/g, "");
}

/** CNPJ: 00.000.000/0000-00 */
export function maskCNPJ(value: string): string {
    const digits = onlyDigits(value).slice(0, 14);
    let result = digits.slice(0, 2);
    if (digits.length > 2) result += "." + digits.slice(2, 5);
    if (digits.length > 5) result += "." + digits.slice(5, 8);
    if (digits.length > 8) result += "/" + digits.slice(8, 12);
    if (digits.length > 12) result += "-" + digits.slice(12, 14);
    return result;
}

/**
 * Telefone: (00) 0000-0000 para fixo (10 dígitos) ou
 * (00) 00000-0000 para celular (11 dígitos) — o formato muda
 * automaticamente assim que o 11º dígito é digitado.
 */
export function maskTelefone(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length === 0) return "";

    let result = "(" + digits.slice(0, 2);
    if (digits.length > 2) result += ") ";

    const isCelular = digits.length > 10;
    const middleEnd = isCelular ? 7 : 6;

    if (digits.length > 2) result += digits.slice(2, middleEnd);
    if (digits.length > middleEnd) result += "-" + digits.slice(middleEnd, isCelular ? 11 : 10);

    return result;
}

/** CEP: 00000-000 */
export function maskCEP(value: string): string {
    const digits = onlyDigits(value).slice(0, 8);
    let result = digits.slice(0, 5);
    if (digits.length > 5) result += "-" + digits.slice(5, 8);
    return result;
}

/**
 * Moeda (BRL): 1.234,56
 * Trata os dígitos como centavos e formata no padrão pt-BR, sem símbolo R$.
 * Funciona com backspace (reconstrói a partir dos dígitos restantes).
 */
export function maskCurrency(value: string): string {
    const digits = onlyDigits(value).slice(0, 13);
    if (digits.length === 0) return "";
    const cents = parseInt(digits, 10);
    return (cents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Converte uma string monetária em um inteiro de centavos.
 * Aceita qualquer entrada (formatada "R$ 1.234,56", com ponto/vírgula ou só
 * dígitos) porque extrai apenas os dígitos. Ex: "R$ 10,05" → 1005 · "1.234,56" → 123456.
 */
export function parseMoneyToCents(value: string): number {
    const digits = onlyDigits(value).slice(0, 14);
    return digits ? parseInt(digits, 10) : 0;
}

/**
 * Formata um inteiro de centavos no padrão brasileiro.
 * withSymbol=false → "1.234,56"; withSymbol=true (padrão) → "R$ 1.234,56".
 * Sempre com 2 casas decimais e separador de milhar.
 */
export function formatMoneyFromCents(cents: number, withSymbol = true): string {
    const sign = cents < 0 ? "-" : "";
    const abs = Math.abs(Math.trunc(cents));
    const whole = Math.floor(abs / 100);
    const frac = abs % 100;
    const body = `${whole.toLocaleString("pt-BR")},${String(frac).padStart(2, "0")}`;
    return withSymbol ? `${sign}R$ ${body}` : `${sign}${body}`;
}

/**
 * Máscara de moeda baseada em centavos para input controlado.
 * Cada tecla numérica entra pela direita (nos centavos) e empurra os dígitos
 * anteriores para a esquerda; backspace remove o último dígito. Teclas não
 * numéricas (exceto backspace) são ignoradas porque a formatação reconstrói
 * apenas a partir dos dígitos restantes.
 * Ex: "1" → "R$ 0,01" · "10" → "R$ 0,10" · "100" → "R$ 1,00" · "1005" → "R$ 10,05"
 */
export function maskMoney(value: string, withSymbol = true): string {
    return formatMoneyFromCents(parseMoneyToCents(value), withSymbol);
}

/** Converte centavos para número puro em reais. Ex: 123456 → 1234.56 */
export function centsToNumber(cents: number): number {
    return cents / 100;
}

/** CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);
    let result = digits.slice(0, 3);
    if (digits.length > 3) result += "." + digits.slice(3, 6);
    if (digits.length > 6) result += "." + digits.slice(6, 9);
    if (digits.length > 9) result += "-" + digits.slice(9, 11);
    return result;
}

/**
 * RG: 00.000.000-0
 * Não existe um padrão nacional único (varia por estado emissor e alguns
 * terminam em dígito verificador "X"), então essa máscara segue o formato
 * mais comum (ex: SP) e aceita X apenas na última posição.
 */
export function maskRG(value: string): string {
    const raw = value
        .toUpperCase()
        .replace(/[^0-9X]/g, "")
        .slice(0, 9);
    let result = raw.slice(0, 2);
    if (raw.length > 2) result += "." + raw.slice(2, 5);
    if (raw.length > 5) result += "." + raw.slice(5, 8);
    if (raw.length > 8) result += "-" + raw.slice(8, 9);
    return result;
}
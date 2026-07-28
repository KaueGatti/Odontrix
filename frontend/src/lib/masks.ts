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
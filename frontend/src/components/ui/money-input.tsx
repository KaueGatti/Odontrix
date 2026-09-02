import * as React from "react";

import { Input } from "@/components/ui/input";
import { formatMoneyFromCents, maskMoney, parseMoneyToCents } from "@/lib/masks";
import { cn } from "@/lib/utils";

/** Limite máximo padrão dos campos de valor: R$ 100.000,00 (em centavos). */
export const MAX_MONEY_CENTS = 10_000_000;

export interface MoneyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "inputMode" | "placeholder"
  > {
  /** Valor em centavos (inteiro). Use `null` para exibir o placeholder (campo vazio). */
  value: number | null;
  /** Chamado a cada alteração com o novo valor em centavos. */
  onCentsChange: (cents: number) => void;
  /** Limite superior em centavos (padrão: R$ 100.000,00). */
  max?: number;
}

/**
 * Input de moeda controlado por centavos — padrão único de campos monetários
 * do projeto (referência: modal de nova cobrança / NovoRegistroDialog).
 *
 * - O valor exibido é sempre formatado ("0,00" → "1.234,56") com o prefixo
 *   "R$" fixo fora do valor;
 * - Cada tecla numérica entra pela direita (nos centavos) e o backspace
 *   remove o último dígito;
 * - O valor é limitado a `max` (padrão R$ 100.000,00).
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ id, value, onCentsChange, max = MAX_MONEY_CENTS, className, disabled, ...rest }, ref) => {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          id={id}
          inputMode="decimal"
          placeholder="0,00"
          disabled={disabled}
          value={value === null ? "" : formatMoneyFromCents(Math.min(value, max), false)}
          onChange={(event) => {
            const masked = maskMoney(event.target.value, false);
            let cents = parseMoneyToCents(masked);
            if (cents > max) cents = max;
            const formatted = formatMoneyFromCents(cents, false);
            if (event.target.value !== formatted) event.target.value = formatted;
            onCentsChange(cents);
          }}
          className={cn("h-10 rounded-[10px] pl-7 text-[13px]", className)}
          {...rest}
        />
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";

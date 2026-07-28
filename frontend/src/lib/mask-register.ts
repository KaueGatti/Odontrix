import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Aplica uma máscara (de @/lib/masks) a um campo registrado via
 * react-hook-form. Como o register() é uncontrolled, a formatação
 * acontece reescrevendo event.target.value antes de repassar o evento
 * pro onChange original do RHF — assim o valor exibido no input e o
 * valor salvo no formulário ficam sempre iguais, já formatados.
 *
 * Uso:
 *   <Input {...withMask(register("cpf"), maskCPF)} />
 */
export function withMask(
  field: UseFormRegisterReturn,
  mask: (value: string) => string,
): UseFormRegisterReturn {
  return {
    ...field,
    onChange: (event) => {
      event.target.value = mask(event.target.value);
      return field.onChange(event);
    },
  };
}

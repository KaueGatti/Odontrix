import { Input } from "@/components/ui/input";
import { ComponentProps, useEffect, useState } from "react";

interface DateInputProps extends Omit<ComponentProps<typeof Input>, "onChange" | "value"> {
    value?: string;
    onChange?: (iso: string) => void;
}

function isoToDisplay(iso: string): string {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function displayToISO(masked: string): string {
    const d = masked.replace(/\D/g, "");
    if (d.length < 8) return "";
    return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
}

export function DateInput({
                              value = "",
                              onChange,
                              placeholder = "dd/mm/aaaa",
                              ...props
                          }: DateInputProps) {
    const [display, setDisplay] = useState(() => isoToDisplay(value));

    // Sincroniza quando o valor externo muda (reset de form, edição, etc.)
    useEffect(() => {
        setDisplay(isoToDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const masked = applyMask(e.target.value);
        setDisplay(masked);

        const iso = displayToISO(masked);
        onChange?.(iso || (masked ? "" : ""));
    };

    return (
        <Input
            {...props}
            value={display}
            onChange={handleChange}
            placeholder={placeholder}
            inputMode="numeric"
            maxLength={10}
        />
    );
}
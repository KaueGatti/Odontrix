// CpfInput.tsx
import { Input } from "@/components/ui/input";
import { ComponentProps, useState } from "react";

interface CpfInputProps extends Omit<ComponentProps<typeof Input>, "onChange" | "value"> {
    value?: string;
    onChange?: (value: string) => void;
}

function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function CPFInput({
                             value = "",
                             onChange,
                             placeholder = "000.000.000-00",
                             ...props
                         }: CpfInputProps) {
    const [display, setDisplay] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const masked = applyMask(e.target.value);
        setDisplay(masked);
        onChange?.(masked);
    };

    return (
        <Input
            {...props}
            value={display}
            onChange={handleChange}
            placeholder={placeholder}
            inputMode="numeric"
            maxLength={14}
        />
    );
}
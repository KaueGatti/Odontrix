// RgInput.tsx
import { Input } from "@/components/ui/input";
import { ComponentProps, useState } from "react";

interface RgInputProps extends Omit<ComponentProps<typeof Input>, "onChange" | "value"> {
    value?: string;
    onChange?: (value: string) => void;
}

function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
}

export function RGInput({
                            value = "",
                            onChange,
                            placeholder = "00.000.000-0",
                            ...props
                        }: RgInputProps) {
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
            inputMode="text"
            maxLength={12}
        />
    );
}
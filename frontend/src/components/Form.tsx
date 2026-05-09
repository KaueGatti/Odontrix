import {ReactNode} from "react";
import {cn} from "@/lib/utils.ts";

export function FormCard({ children, className }: { children: ReactNode, className?: string }) {
    return (
        <div className={cn("border border-gray-200 rounded-lg shadow-sm p-6 bg-white", className)}>
            {children}
        </div>
    )
}
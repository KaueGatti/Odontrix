import {XIcon} from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog'
import {ReactNode} from "react";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode
}

export default function Modal({ open, onOpenChange, children }: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-2 w-full max-w-md shadow-xl">
                    <Dialog.Close asChild>
                        <button className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XIcon/>
                        </button>
                    </Dialog.Close>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Lock} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

import {useAuth} from "@/auth/AuthContext";
import {ApiError} from "@/lib/api";

const trocarSenhaSchema = z
    .object({
        atual: z.string().min(1, "Informe a senha atual"),
        nova: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres"),
        confirmar: z.string().min(1, "Confirme a nova senha"),
    })
    .refine((data) => data.nova === data.confirmar, {
        message: "As senhas não coincidem",
        path: ["confirmar"],
    });

type TrocarSenhaValues = z.infer<typeof trocarSenhaSchema>;

/**
 * Dialog bloqueante de troca de senha obrigatória — permanece aberto
 * enquanto user.forcePasswordChange for true (senha provisória definida
 * por reset administrativo). O sucesso (changePassword → refreshUser)
 * baixa a flag e o dialog fecha sozinho.
 */
export function TrocarSenhaDialog() {
    const {user, changePassword} = useAuth();
    const open = Boolean(user?.forcePasswordChange);

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<TrocarSenhaValues>({
        resolver: zodResolver(trocarSenhaSchema),
    });

    const onSubmit = async (data: TrocarSenhaValues) => {
        try {
            await changePassword({currentPassword: data.atual, newPassword: data.nova});
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível conectar ao servidor. Tente novamente.";
            setError("root", {message});
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent
                className="max-w-[420px]"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Troca de senha obrigatória</DialogTitle>
                    <DialogDescription>
                        Sua senha é provisória (definida por um administrador).
                        Defina uma nova senha para continuar usando o sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    {errors.root && (
                        <p
                            role="alert"
                            className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                        >
                            {errors.root.message}
                        </p>
                    )}

                    <div>
                        <Label htmlFor="senha-atual" className="mb-1.5 block">
                            Senha atual
                        </Label>
                        <Input
                            id="senha-atual"
                            type="password"
                            autoComplete="current-password"
                            aria-invalid={!!errors.atual}
                            {...register("atual")}
                        />
                        {errors.atual && (
                            <p className="mt-1.5 text-xs text-destructive">{errors.atual.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="senha-nova" className="mb-1.5 block">
                            Nova senha
                        </Label>
                        <Input
                            id="senha-nova"
                            type="password"
                            autoComplete="new-password"
                            aria-invalid={!!errors.nova}
                            {...register("nova")}
                        />
                        {errors.nova && (
                            <p className="mt-1.5 text-xs text-destructive">{errors.nova.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="senha-confirmar" className="mb-1.5 block">
                            Confirmar nova senha
                        </Label>
                        <Input
                            id="senha-confirmar"
                            type="password"
                            autoComplete="new-password"
                            aria-invalid={!!errors.confirmar}
                            {...register("confirmar")}
                        />
                        {errors.confirmar && (
                            <p className="mt-1.5 text-xs text-destructive">
                                {errors.confirmar.message}
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        <Lock className="h-4 w-4"/>
                        {isSubmitting ? "Salvando..." : "Salvar nova senha"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

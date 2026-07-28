import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link} from "react-router";
import {Mail, Send, ArrowLeft, Lock, CheckCircle2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    recuperarSenhaSchema,
    type RecuperarSenhaFormValues,
} from "@/lib/validations/recuperar-senha.schema.ts";

type ScreenState = "request" | "sent";

export default function RecuperarSenhaPage() {
    const [state, setState] = useState<ScreenState>("request");
    const [sentTo, setSentTo] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<RecuperarSenhaFormValues>({
        resolver: zodResolver(recuperarSenhaSchema),
    });

    const onSubmit = async (data: RecuperarSenhaFormValues) => {
        // TODO: integrar com o endpoint real de recuperação de senha
        setSentTo(data.loginOuEmail);
        setState("sent");
    };

    const handleRetry = () => {
        reset();
        setState("request");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-muted">
            {/* ===== ESQUERDA: FORMULÁRIO ===== */}
            <div
                className="relative z-10 flex w-full flex-shrink-0 flex-col bg-background px-12 py-6 shadow-[4px_0_32px_rgba(15,32,80,0.1)] md:w-2/5">
                <div className="mb-4 flex items-center gap-2.5">
                    <div className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px] bg-primary"/>
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                        Odontrix{" "}
                        <span className="font-normal text-muted-foreground">
              · Gestão de Clínicas
            </span>
                    </div>
                </div>

                {state === "request" ? (
                    <div className="w-full">
                        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                            Recuperação de acesso
                        </p>
                        <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
                            Esqueceu sua senha?
                        </h1>
                        <p className="mb-9 text-sm leading-relaxed text-muted-foreground">
                            Informe o login{" "}
                            <strong className="font-semibold text-foreground">ou</strong> o
                            e-mail cadastrado. Vamos enviar um link seguro para você criar
                            uma nova senha.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)}
                              noValidate
                              className="mb-6 flex flex-col gap-2">
                            <Label htmlFor="loginOuEmail" className="mb-2 block">
                                Login ou e-mail
                            </Label>
                            <div className="relative">
                                <Mail
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    id="loginOuEmail"
                                    type="text"
                                    placeholder="seu.login ou nome@clinica.com"
                                    className="pl-11"
                                    aria-invalid={!!errors.loginOuEmail}
                                    {...register("loginOuEmail")}
                                />
                            </div>
                            {errors.loginOuEmail && (
                                <p className="mb-4 text-xs text-destructive">
                                    {errors.loginOuEmail.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 w-full"
                            >
                                <Send className="h-4 w-4"/>
                                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                            </Button>
                        </form>

                        <Link
                            to="/login"
                            className="mt-7 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-3.5 w-3.5"/>
                            Voltar para o login
                        </Link>

                        <div
                            className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
                            <strong className="font-semibold text-foreground/80">
                                Acesso restrito a colaboradores.
                            </strong>{" "}
                            Se você não reconhece o login informado ou não tem mais acesso
                            ao e-mail cadastrado, fale com o gerente responsável pela
                            clínica.
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                            <Mail className="h-6 w-6 text-primary"/>
                        </div>
                        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                            Verifique seu e-mail
                        </p>
                        <h1 className="mb-3 text-[28px] font-bold tracking-tight text-foreground">
                            Link enviado
                        </h1>
                        <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
                            Se os dados informados corresponderem a uma conta ativa, você
                            receberá um e-mail em{" "}
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-foreground">
                {sentTo || "nome@clinica.com"}
              </span>{" "}
                            com as instruções para redefinir sua senha. O link expira em 30
                            minutos.
                        </p>

                        <Link
                            to="/login"
                            className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-3.5 w-3.5"/>
                            Voltar para o login
                        </Link>

                        <div className="mt-7 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                            Não recebeu o e-mail?
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="font-semibold text-primary hover:underline"
                            >
                                Tentar novamente
                            </button>
                        </div>

                        <div
                            className="mt-10 max-w-[420px] rounded-lg border border-border bg-muted/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
                            <strong className="font-semibold text-foreground/80">
                                Não encontrou a mensagem?
                            </strong>{" "}
                            Verifique a caixa de spam ou lixo eletrônico. Se o problema
                            persistir, entre em contato com o gerente responsável pela
                            clínica.
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-8 text-xs text-muted-foreground/60">
                    © {new Date().getFullYear()} Odontrix · Todos os direitos
                    reservados
                </div>
            </div>

            {/* ===== DIREITA: ILUSTRAÇÃO ===== */}
            <div
                className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,var(--blue-dark)_0%,var(--blue-mid)_55%,var(--blue-light)_100%)] px-14 py-12 md:flex">
                <div
                    className="pointer-events-none absolute -right-[140px] -top-[140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(79,126,247,0.16),transparent_70%)]"/>
                <div
                    className="pointer-events-none absolute -bottom-[120px] -left-[80px] h-[420px] w-[420px] rounded-full bg-primary/[0.06]"/>
                <div
                    className="pointer-events-none absolute bottom-[60px] left-[60px] h-[340px] w-[340px] rounded-full border border-white/[0.06]"/>

                <div className="relative z-[2] flex flex-1 items-center justify-center">
                    <div className="relative h-[280px] w-[280px]">
                        <div
                            className="absolute left-[30px] top-[30px] flex h-[220px] w-[220px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.06] backdrop-blur-[2px]">
                            <div
                                className="flex h-[88px] w-[88px] items-center justify-center rounded-[22px] bg-primary">
                                <Lock className="h-10 w-10 text-white"/>
                            </div>
                        </div>

                        <div
                            className="absolute -left-[46px] -top-1.5 flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3.5 text-white">
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-primary/[0.22]">
                                <CheckCircle2 className="h-4 w-4 text-indigo-200"/>
                            </div>
                            <div>
                                <div className="text-[13px] font-semibold">Link seguro</div>
                                <div className="text-[11.5px] text-white/55">
                                    expira em 30 min
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute -right-[70px] bottom-1.5 flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3.5 text-white">
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-green-400/[0.18]">
                                <Mail className="h-4 w-4 text-green-300"/>
                            </div>
                            <div>
                                <div className="text-[13px] font-semibold">
                                    E-mail verificado
                                </div>
                                <div className="text-[11.5px] text-white/55">
                                    nome@clinica.com
                                </div>
                            </div>
                        </div>

                        <span className="absolute left-[130px] top-2 h-1.5 w-1.5 rounded-full bg-indigo-300"/>
                        <span className="absolute bottom-[26px] left-4 h-1.5 w-1.5 rounded-full bg-indigo-300"/>
                        <span className="absolute right-[-10px] top-[120px] h-1.5 w-1.5 rounded-full bg-indigo-300"/>
                    </div>
                </div>

                <div className="relative z-[2]">
                    <p className="mb-4 text-[21px] font-semibold leading-[1.35] tracking-tight text-white">
                        Recupere seu acesso{" "}
                        <span className="font-semibold text-white/50">
              com segurança.
            </span>
                    </p>
                    <div className="flex flex-wrap gap-5">
                        <Step label="Verificação por e-mail"/>
                        <Step label="Link com validade limitada"/>
                        <Step label="Nova senha criptografada"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({label}: { label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-[13.5px] text-white/75">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300"/>
            {label}
        </div>
    );
}

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link} from "react-router";
import {
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Key,
    MonitorSmartphone,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {
    redefinirSenhaSchema,
    type RedefinirSenhaFormValues,
} from "@/lib/validations/redefinir-senha.schema.ts";

const REQUIREMENTS = [
    {
        key: "len",
        label: "Mínimo de 8 caracteres",
        test: (v: string) => v.length >= 8,
    },
    {
        key: "upper",
        label: "Uma letra maiúscula",
        test: (v: string) => /[A-Z]/.test(v),
    },
    {key: "num", label: "Um número", test: (v: string) => /[0-9]/.test(v)},
    {
        key: "special",
        label: "Um caractere especial",
        test: (v: string) => /[^A-Za-z0-9]/.test(v),
    },
] as const;

const STRENGTH_LABELS = [
    "Digite uma senha",
    "Fraca",
    "Razoável",
    "Boa",
    "Forte",
];
const STRENGTH_BAR_COLORS = [
    "bg-border",
    "bg-destructive",
    "bg-amber-500",
    "bg-blue-500",
    "bg-green-500",
];
const STRENGTH_TEXT_COLORS = [
    "text-muted-foreground",
    "text-destructive",
    "text-amber-500",
    "text-blue-500",
    "text-green-500",
];

export default function RedefinirSenhaPage() {
    const [showPw1, setShowPw1] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors, isSubmitting},
    } = useForm<RedefinirSenhaFormValues>({
        resolver: zodResolver(redefinirSenhaSchema),
    });

    const novaSenha = watch("novaSenha") ?? "";
    const confirmarSenha = watch("confirmarSenha") ?? "";

    const metCount = REQUIREMENTS.filter((r) => r.test(novaSenha)).length;
    const score = novaSenha.length === 0 ? 0 : metCount;

    const showMatchNote = confirmarSenha.length > 0;
    const passwordsMatch = confirmarSenha === novaSenha;

    const onSubmit = async (data: RedefinirSenhaFormValues) => {
        // TODO: integrar com o endpoint real de redefinição de senha
        console.log(data);
        setIsDone(true);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-muted">
            {/* ===== ESQUERDA: FORMULÁRIO ===== */}
            <div className="relative z-10 flex w-full flex-shrink-0 flex-col bg-background px-12 py-6 shadow-[4px_0_32px_rgba(15,32,80,0.1)] md:w-2/5">
                <div className="mb-4 flex items-center gap-2.5">
                    <div className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px] bg-primary"/>
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                        Odontrix{" "}
                        <span className="font-normal text-muted-foreground">
              · Gestão de Clínicas
            </span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    <div className="w-full">
                        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.09em] text-primary">
                            Redefinição de senha
                        </p>
                        <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
                            Crie uma nova senha
                        </h1>
                        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                            Escolha uma senha forte e diferente das anteriores para manter
                            sua conta protegida.
                        </p>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="flex flex-col"
                        >
                            <div className="mb-1.5">
                                <Label htmlFor="novaSenha" className="mb-1.5 block">
                                    Nova senha
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                    <Input
                                        id="novaSenha"
                                        type={showPw1 ? "text" : "password"}
                                        placeholder="Digite sua nova senha"
                                        className="pl-10 pr-10"
                                        aria-invalid={!!errors.novaSenha}
                                        {...register("novaSenha")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw1((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPw1 ? "Ocultar senha" : "Mostrar senha"}
                                        tabIndex={-1}
                                    >
                                        {showPw1 ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        )}
                                    </button>
                                </div>

                                { /* <div className="mt-2 flex items-center gap-2.5">
                                    <div className="flex flex-1 gap-1">
                                        {[0, 1, 2, 3].map((i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    "h-1 flex-1 rounded-full transition-colors",
                                                    i < score ? STRENGTH_BAR_COLORS[score] : "bg-border",
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span
                                        className={cn(
                                            "whitespace-nowrap text-[10.5px] font-semibold",
                                            STRENGTH_TEXT_COLORS[score],
                                        )}
                                    >
                    {STRENGTH_LABELS[score]}
                  </span>
                                </div> */ }
                            </div>

                            <div className="mb-1.5 mt-1">
                                <Label htmlFor="confirmarSenha" className="mb-1.5 block">
                                    Confirmar nova senha
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                    <Input
                                        id="confirmarSenha"
                                        type={showPw2 ? "text" : "password"}
                                        placeholder="Repita a nova senha"
                                        className="pl-10 pr-10"
                                        aria-invalid={!!errors.confirmarSenha}
                                        {...register("confirmarSenha")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw2((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPw2 ? "Ocultar senha" : "Mostrar senha"}
                                        tabIndex={-1}
                                    >
                                        {showPw2 ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        )}
                                    </button>
                                </div>
                                {showMatchNote && (
                                    <div
                                        className={cn(
                                            "mt-1.5 flex items-center gap-1.5 text-[11px] font-medium",
                                            passwordsMatch ? "text-green-600" : "text-destructive",
                                        )}
                                    >
                                        {passwordsMatch ? (
                                            <CheckCircle2 className="h-3 w-3"/>
                                        ) : (
                                            <AlertCircle className="h-3 w-3"/>
                                        )}
                                        {passwordsMatch
                                            ? "As senhas coincidem"
                                            : "As senhas não coincidem"}
                                    </div>
                                )}
                                {errors.confirmarSenha && !showMatchNote && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.confirmarSenha.message}
                                    </p>
                                )}
                            </div>

                            { /* <div className="my-2 rounded-md border border-border bg-muted/40 px-3.5 py-2.5">
                                <div className="mb-2 text-[11px] font-semibold text-foreground/80">
                                    Sua senha deve conter:
                                </div>
                                <div className="grid grid-cols-2 gap-x-3.5 gap-y-1.5">
                                    {REQUIREMENTS.map((req) => {
                                        const met = req.test(novaSenha);
                                        return (
                                            <div
                                                key={req.key}
                                                className={cn(
                                                    "flex items-center gap-1.5 text-[11.5px] transition-colors",
                                                    met ? "text-green-600" : "text-muted-foreground",
                                                )}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0"/>
                                                {req.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>*/ }

                            <Button
                                type="submit"
                                disabled={isSubmitting || isDone}
                                className={cn(isDone && "bg-green-600 hover:bg-green-600")}
                            >
                                {isDone ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4"/>
                                        Senha salva com sucesso
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4"/>
                                        {isSubmitting ? "Salvando..." : "Salvar nova senha"}
                                    </>
                                )}
                            </Button>
                        </form>

                        <Link
                            to="/login"
                            className="mt-3.5 flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-3.5 w-3.5"/>
                            Voltar para o login
                        </Link>

                        <div
                            className="mt-2 rounded-md border border-border bg-muted/40 p-3 text-[13px] leading-relaxed text-muted-foreground">
                            <strong className="font-semibold text-foreground/80">
                                Por segurança
                            </strong>
                            , ao salvar a nova senha você será desconectado automaticamente
                            de todos os outros dispositivos onde sua conta estiver logada.
                        </div>
                    </div>
                </div>

                <div className="pt-3.5 text-[11px] text-muted-foreground/60">
                    © {new Date().getFullYear()} Odontrix · Todos os direitos reservados
                </div>
            </div>

            {/* ===== DIREITA: ILUSTRAÇÃO ===== */}
            <div
                className="relative hidden flex-1 flex-col justify-end overflow-hidden bg-[linear-gradient(145deg,var(--blue-dark)_0%,var(--blue-mid)_55%,var(--blue-light)_100%)] px-16 py-16 md:flex">
                <div
                    className="pointer-events-none absolute -right-[120px] -top-[140px] h-[520px] w-[520px] rounded-full border border-white/[0.07]"/>
                <div
                    className="pointer-events-none absolute -bottom-[100px] -left-[80px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(79,126,247,0.12),transparent_70%)]"/>
                <span
                    className="pointer-events-none absolute right-[38%] top-[16%] h-[5px] w-[5px] rounded-full bg-primary"/>
                <span
                    className="pointer-events-none absolute left-[20%] top-[46%] h-[5px] w-[5px] rounded-full bg-primary"/>
                <span
                    className="pointer-events-none absolute bottom-[22%] right-[18%] h-[5px] w-[5px] rounded-full bg-primary"/>

                <div
                    className="absolute left-1/2 top-1/2 flex h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[26px] border border-white/15 bg-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
                    <Key className="h-12 w-12 text-indigo-300"/>
                </div>

                <div
                    className="absolute left-[calc(50%-230px)] top-[calc(50%-230px)] flex items-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-3.5 shadow-[0_24px_48px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                    <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-green-400/[0.16]">
                        <ShieldCheck className="h-[18px] w-[18px] text-green-400"/>
                    </div>
                    <div>
                        <div className="text-[13px] font-semibold text-white">
                            Conexão segura
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-slate-400">
                            Criptografia TLS 256-bit
                        </div>
                    </div>
                </div>

                <div
                    className="absolute left-[calc(50%+40px)] top-[calc(50%+90px)] flex items-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-3.5 shadow-[0_24px_48px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                    <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary/[0.18]">
                        <MonitorSmartphone className="h-[18px] w-[18px] text-indigo-300"/>
                    </div>
                    <div>
                        <div className="text-[13px] font-semibold text-white">
                            Sessões encerradas
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-slate-400">
                            Em todos os dispositivos
                        </div>
                    </div>
                </div>

                <div className="relative z-[2]">
                    <p className="mb-3.5 text-[21px] leading-[1.35] tracking-tight text-white">
                        Escolha uma senha forte
                        <br/>
                        e mantenha sua conta protegida.
                    </p>
                    <div className="flex gap-5 items-center">
                        <Dot/>
                        <Feature label="Criptografia de ponta a ponta"/>
                        <Dot/>
                        <Feature label="Sessão atual encerrada"/>
                        <Dot/>
                        <Feature label="Recomendações de segurança"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Feature({label}: { label: string }) {
    return (
        <span className="text-[12.5px] font-medium text-slate-300">{label}</span>
    );
}

function Dot() {
    return <div className="h-1 w-1 rounded-full bg-primary"/>;
}

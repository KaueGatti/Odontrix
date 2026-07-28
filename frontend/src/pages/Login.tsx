import {useState, type ReactNode} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link} from "react-router";
import {
    User,
    Lock,
    LogIn,
    Eye,
    EyeOff,
    CalendarCheck,
    Clock,
    Users,
    TrendingUp,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {loginSchema, type LoginFormValues} from "@/lib/validations/login.schema.ts";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        // TODO: integrar com o endpoint real de autenticação
        console.log(data);
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

                <div className="flex flex-1 flex-col">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.09em] text-primary">
                        Acesso ao sistema
                    </p>
                    <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
                        Bem-vindo de volta
                    </h1>
                    <p className="mb-9 text-sm leading-relaxed text-muted-foreground">
                        Informe suas credenciais para acessar o painel da clínica.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="mb-6 flex flex-col gap-4"
                    >
                        <div>
                            <Label htmlFor="login" className="mb-1.5 block">
                                Login
                            </Label>
                            <div className="relative">
                                <User
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    id="login"
                                    type="text"
                                    placeholder="seu.login"
                                    autoComplete="username"
                                    className="pl-10"
                                    aria-invalid={!!errors.login}
                                    {...register("login")}
                                />
                            </div>
                            {errors.login && (
                                <p className="mt-1.5 text-xs text-destructive">
                                    {errors.login.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="senha" className="mb-1.5 block">
                                Senha
                            </Label>
                            <div className="relative">
                                <Lock
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    id="senha"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="pl-10 pr-10"
                                    aria-invalid={!!errors.senha}
                                    {...register("senha")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4"/>
                                    ) : (
                                        <Eye className="h-4 w-4"/>
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                {errors.senha ? (
                                    <p className="text-xs text-destructive">
                                        {errors.senha.message}
                                    </p>
                                ) : (
                                    <span/>
                                )}
                                <Link
                                    to="/recover-password"
                                    className="text-[11px] font-medium text-primary hover:underline"
                                >
                                    Esqueci minha senha
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                            <LogIn className="h-4 w-4"/>
                            {isSubmitting ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>

                    <div
                        className="mt-2 rounded-lg border border-border bg-muted/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
                        <strong className="text-foreground/80">
                            Acesso restrito a colaboradores.
                        </strong>{" "}
                        Esta área é de uso exclusivo da equipe interna da clínica. Em caso
                        de problemas com seu acesso, fale com o gerente responsável.
                    </div>
                </div>

                <div className="mt-auto pt-8 text-xs text-muted-foreground/60">
                    © {new Date().getFullYear()} Odontrix · Todos os direitos
                    reservados
                </div>
            </div>

            {/* ===== DIREITA: ILUSTRAÇÃO ===== */}
            <div
                className="relative hidden flex-1 flex-col overflow-hidden bg-[linear-gradient(145deg,var(--blue-dark)_0%,var(--blue-mid)_55%,var(--blue-light)_100%)] px-12 py-12 md:flex">
                <div
                    className="pointer-events-none absolute -right-[180px] -top-[220px] h-[640px] w-[640px] rounded-full bg-white/[0.04]"/>
                <div
                    className="pointer-events-none absolute -bottom-[140px] -left-[100px] h-[400px] w-[400px] rounded-full bg-white/[0.03]"/>
                <div
                    className="pointer-events-none absolute left-[18%] top-[42%] h-[180px] w-[180px] rounded-full bg-primary/[0.14]"/>

                <div className="relative z-[2] flex-1">
                    <MetricCard
                        className="left-1/2 top-1/2 w-[188px] -translate-x-[200px] -translate-y-[175px] rotate-[-4deg]"
                        icon={<CalendarCheck className="h-4 w-4 text-indigo-300"/>}
                        iconBg="bg-primary/30"
                        value="24"
                        label="consultas hoje"
                        tag={
                            <>
                                <Clock className="h-2.5 w-2.5"/> 3 aguardando confirmação
                            </>
                        }
                    />
                    <MetricCard
                        className="left-1/2 top-1/2 w-[172px] translate-x-[28px] -translate-y-[80px] rotate-[3deg]"
                        icon={<Users className="h-4 w-4 text-green-300"/>}
                        iconBg="bg-green-400/[0.18]"
                        value="1.248"
                        label="pacientes ativos"
                        tag={
                            <>
                                <TrendingUp className="h-2.5 w-2.5"/> +12 este mês
                            </>
                        }
                    />
                    <FinanceCard
                        className="left-1/2 top-1/2 w-[222px] -translate-x-[88px] translate-y-[48px] rotate-[-1.5deg]"/>
                </div>

                <div className="relative z-[2]">
                    <p className="mb-3.5 text-[21px] font-semibold leading-[1.35] tracking-tight text-white">
                        Gestão completa{" "}
                        <em className="not-italic text-white/40">para</em>
                        <br/>
                        clínicas odontológicas.
                    </p>
                    <div className="flex gap-5">
                        <Feature label="Agenda inteligente"/>
                        <Feature label="Controle financeiro"/>
                        <Feature label="Prontuário digital"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
                        className,
                        icon,
                        iconBg,
                        value,
                        label,
                        tag,
                    }: {
    className?: string;
    icon: ReactNode;
    iconBg: string;
    value: string;
    label: string;
    tag: ReactNode;
}) {
    return (
        <div
            className={cn(
                "absolute rounded-lg border border-white/[0.16] bg-white/[0.08] p-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-[14px]",
                className,
            )}
        >
            <div
                className={cn(
                    "mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-[7px]",
                    iconBg,
                )}
            >
                {icon}
            </div>
            <div className="mb-0.5 text-[22px] font-bold leading-none tracking-tight">
                {value}
            </div>
            <div className="text-[11px] text-white/55">{label}</div>
            <div
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/65">
                {tag}
            </div>
        </div>
    );
}

function FinanceCard({className}: { className?: string }) {
    const bars = [40, 62, 48, 85, 70, 92, 58, 44];
    return (
        <div
            className={cn(
                "absolute rounded-lg border border-white/[0.16] bg-white/[0.08] p-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-[14px]",
                className,
            )}
        >
            <div className="mb-2 text-[10px] uppercase tracking-[0.05em] text-white/40">
                A receber — junho
            </div>
            <div className="mb-1.5 flex h-[26px] items-end gap-[3px]">
                {bars.map((h, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-[9px] rounded-t-[2px] bg-white/[0.22]",
                            (i === 3 || i === 5) && "bg-white/80",
                        )}
                        style={{height: `${h}%`}}
                    />
                ))}
            </div>
            <div className="text-lg font-bold tracking-tight">R$ 38.450</div>
            <div className="text-[11px] text-white/55">em pagamentos pendentes</div>
        </div>
    );
}

function Feature({label}: { label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-[11.5px] text-white/50">
            <div className="h-[5px] w-[5px] rounded-full bg-primary"/>
            {label}
        </div>
    );
}
'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { ChangeEvent, startTransition, SubmitEvent, useActionState, useEffect, useRef, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { TextLink } from '@/_components/text-link';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { loginUser } from '@/_actions/loginuser';
import { useRouter, useSearchParams } from 'next/navigation';
import { csrfTokenProps, LoginFormProps } from '@/_types';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';
import Link from 'next/link';

export function LoginClient({ csrfToken }: csrfTokenProps) {
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get('email') ?? '';
    const statusFromParams = searchParams.get('status');
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(loginUser, undefined);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [isVisibledPassword, setIsVisibledPassword] = useState<boolean>(false);
    const [data, setData] = useState<LoginFormProps>({ email: emailFromParams, password: '' });

    const togglePasswordVisibility = () => setIsVisibledPassword(!isVisibledPassword);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const submit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    useEffect(() => {
        if (state?.warning && emailRef.current) {
            emailRef.current.focus();
            return;
        };

        if (!state?.message) return;

        startTransition(() => {
            setData({ email: '', password: '' });
        });
        router.push('/dashboard');
    }, [state, router]);
    useEffect(() => {
        if (state?.retryAfterSeconds) setSecondsLeft(state.retryAfterSeconds);
    }, [state?.retryAfterSeconds]);
    useEffect(() => {
        if (!secondsLeft) return;

        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <Link
                    href="/"
                    className="size-16 dark:invert 2xl:hidden rounded-full"
                >
                    <AppLogoIconSvg className="rounded-full" />
                </Link>
                <h1 className="text-xl font-medium">Faça login na sua conta</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Insira seu e-mail e senha abaixo para fazer login.
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6 mx-auto"
            >
                <div className=" grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Endereço de email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            readOnly={Boolean(emailFromParams)}
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="email@exemplo.com"
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Senha</Label>
                            {!statusFromParams && (
                                <TextLink
                                    href="/forgot-password"
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Esqueceu sua senha?
                                </TextLink>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                type={isVisibledPassword ? "text" : "password"}
                                ref={passwordRef}
                                required
                                tabIndex={2}
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Senha"
                            />
                            <button
                                type="button"
                                title={isVisibledPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={togglePasswordVisibility}
                                className="btn-icon-toggle"
                            >
                                {isVisibledPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={3}
                        disabled={pending || secondsLeft !== null}
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Conecte-se
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        Não existe conta!&nbsp;&nbsp;
                        <TextLink
                            href="/register"
                            tabIndex={4}
                        >
                            Register-se
                        </TextLink>
                    </div>
                </div>
            </form>

            {state?.message && <p className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</p>}
            {!state?.message && state?.warning && (
                <p className="mb-4 text-center text-sm font-medium text-red-400">
                    {secondsLeft !== null
                        ? `Too many login attempts. Please try again in ${secondsLeft < 60
                            ? `${secondsLeft} second${secondsLeft !== 1 ? 's' : ''}`
                            : `${Math.ceil(secondsLeft / 60)} minute${Math.ceil(secondsLeft / 60) !== 1 ? 's' : ''}`
                        }.`
                        : state.warning
                    }
                </p>
            )}
            {!state?.message && !state?.warning && statusFromParams && <p className="mb-4 text-center text-sm font-medium text-blue-600">{statusFromParams}</p>}
        </div>
    );
}
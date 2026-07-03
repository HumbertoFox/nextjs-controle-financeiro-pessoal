'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { ChangeEvent, startTransition, SubmitEvent, useActionState, useEffect, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '@/_actions/resetpassword';
import { csrfTokenProps, ResetPasswordForm } from '@/_types';
import { TextLink } from '@/_components/text-link';
import { PasswordChecklist } from '@/_components/password-checklist';
import Link from 'next/link';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

export default function ResetPasswordClient({ csrfToken }: csrfTokenProps) {
    const searchParams = useSearchParams();
    const [state, action, pending] = useActionState(resetPassword, undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<ResetPasswordForm>({ token: searchParams.get('token') ?? '', password: '', password_confirmation: '' });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);
    const submit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    useEffect(() => {
        if (!state?.message) return;

        startTransition(() => {
            setData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        });
    }, [state]);
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <Link
                    href="/"
                    className="size-16 dark:invert 2xl:hidden rounded-full"
                >
                    <AppLogoIconSvg className="rounded-full" />
                </Link>
                <h1 className="text-xl font-medium">Redefinir senha</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Por favor, insira sua nova senha abaixo.
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6 mx-auto"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="token">Token</Label>
                        <Input
                            id="token"
                            type="text"
                            name="token"
                            tabIndex={1}
                            value={data.token}
                            readOnly
                            required
                            className="block w-full cursor-default"
                        />
                        {state?.errors?.token?.[0] && <InputError message={state.errors.token[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                type={showPassword ? "text" : "password"}
                                tabIndex={2}
                                value={data.password}
                                className="block w-full"
                                autoFocus
                                onChange={handleChange}
                                placeholder="Senha"
                                required
                            />
                            <button
                                type="button"
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={toggleShowPassword}
                                className="btn-icon-toggle"
                            >
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        <PasswordChecklist password={data.password} />
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirme sua senha.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="off"
                                type={showPasswordConfirm ? "text" : "password"}
                                tabIndex={3}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirme sua senha"
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPasswordConfirm ? "Ocultar senha" : "Mostrar senha"}
                                onClick={toggleShowPasswordConfirm}
                                className="btn-icon-toggle"
                            >
                                {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                    </div>

                    <Button
                        type="submit"
                        disabled={pending}
                        className="mt-4 w-full"
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Redefinir senha
                    </Button>
                </div>
            </form>

            {state?.message && <p className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</p>}
            {state?.warning && <p className="mb-4 text-center text-sm font-medium text-red-600">{state.warning}</p>}

            {state?.message && (
                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>voltar para</span>
                    <TextLink href="/login">Conecte-se</TextLink>
                </div>
            )}
        </div>
    );
}

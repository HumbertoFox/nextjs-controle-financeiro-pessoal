'use client';

import { LoaderCircle } from 'lucide-react';
import { ChangeEvent, startTransition, SubmitEvent, useActionState, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { TextLink } from '@/_components/text-link';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { forgotPassword } from '@/_actions/forgotpassword';
import { csrfTokenProps } from '@/_types';
import Link from 'next/link';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

export default function ForgotPasswordClient({ csrfToken }: csrfTokenProps) {
    const [state, action, pending] = useActionState(forgotPassword, undefined);
    const [data, setData] = useState<Required<{ email: string }>>({ email: '' });

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
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <Link
                    href="/"
                    className="size-16 dark:invert 2xl:hidden rounded-full"
                >
                    <AppLogoIconSvg className="rounded-full" />
                </Link>
                <h1 className="text-xl font-medium">Esqueceu sua senha?</h1>
                <p className="text-muted-foreground text-sm text-balance">Insira seu e-mail para receber um link para redefinir sua senha.</p>
            </div>
            {state?.message && <p className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</p>}
            {state?.error && <p className="mb-4 text-center text-sm font-medium text-red-600">{state.error}</p>}

            <div className="space-y-6">
                <form
                    onSubmit={submit}
                    className="w-full max-w-xs flex flex-col gap-6 mx-auto"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="email">Endereço de email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={handleChange}
                            placeholder="email@exemplo.com"
                            required
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full"
                        >
                            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Link para redefinir a senha do e-mail
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>Ou, volte para</span>
                    <TextLink href="/login">Conecte-se</TextLink>
                </div>
            </div>
        </div>
    );
}
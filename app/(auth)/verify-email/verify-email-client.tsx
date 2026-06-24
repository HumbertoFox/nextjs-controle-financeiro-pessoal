'use client';

import { LoaderCircle } from 'lucide-react';
import { startTransition, SubmitEvent, useActionState, useEffect } from 'react';
import { TextLink } from '@/_components/text-link';
import { Button } from '@/_components/ui/button';
import { useSearchParams } from 'next/navigation';
import { handleEmailVerification } from '@/_actions/handleemailverification';
import { csrfTokenProps } from '@/_types';
import { Label } from '@/_components/ui/label';
import { Input } from '@/_components/ui/input';

export default function VerifyEmailClient({ csrfToken }: csrfTokenProps) {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const [state, action, pending] = useActionState(handleEmailVerification, undefined);
    const submit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    useEffect(() => {
        if (email && token) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('token', token);
            if (csrfToken) formData.append('csrfToken', csrfToken);
            startTransition(() => action(formData));
        }
    }, [email, token, csrfToken, action]);
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <h1 className="text-xl font-medium">Verifique seu e-mail</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Por favor, verifique seu endereço de e-mail clicando no link que acabamos de lhe enviar.
                </p>
            </div>
            {state?.success && <p className="mb-4 text-center text-sm font-medium text-blue-600">{state.success}</p>}
            {state?.error && <p className="mb-4 text-center text-sm font-medium text-red-600">{state.error}</p>}

            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6 mx-auto"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={email ?? ''}
                            readOnly
                            required
                            className="block text-gray-400 w-full cursor-default"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="token">Token</Label>
                        <Input
                            id="token"
                            type="text"
                            name="token"
                            value={token ?? ''}
                            readOnly
                            required
                            className="block w-full text-gray-400 cursor-default"
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    variant="secondary"
                    disabled={pending || Boolean(state?.success) || Boolean(state?.error)}
                    className="cursor-pointer"
                >
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Reenviar e-mail de verificação
                </Button>

                <TextLink
                    href={!state?.success ? "/login" : `/login?status=email%20verified&email=${email}`}
                    className="mx-auto block text-sm"
                >
                    {!state?.success ? 'Conecte-se' : 'Continuar para iniciar sessão'}
                </TextLink>
            </form>
        </div>
    );
}
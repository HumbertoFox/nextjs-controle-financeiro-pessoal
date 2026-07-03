'use client';

import { LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { handleEmailVerification } from '@/_actions/handleemailverification';
import { emailVerifiedChecked } from '@/_actions/emailverified';
import { csrfTokenProps } from '@/_types';
import { Button } from '@/_components/ui/button';
import { TextLink } from '@/_components/text-link';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';

export default function VerifyEmailSettingsClient({ csrfToken }: csrfTokenProps) {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const [state, action, pending] = useActionState(handleEmailVerification, undefined);
    const [resendState, resendAction, resendPending] = useActionState(emailVerifiedChecked, undefined);

    useEffect(() => {
        if (email && token) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('token', token);
            if (csrfToken) formData.append('csrfToken', csrfToken);
            startTransition(() => action(formData));
        }
    }, [email, token, csrfToken, action]);

    const handleResend = () => {
        startTransition(() => resendAction());
    };

    const isVerified = Boolean(state?.success);
    const resentOk = resendState === 'verification-link-sent';
    const resentError = resendState === 'verification-error';

    return (
        <div className="space-y-6">
            <div className="mb-8 my-1 space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">Verificação de e-mail</h2>
                <p className="text-muted-foreground text-sm">
                    Verifique seu endereço de e-mail para acessar todos os recursos.
                    {email && (
                        <>Um link foi enviado para <span className="font-medium text-foreground">{email}</span>.</>
                    )}
                </p>
            </div>

            {/* Feedback de verificação */}
            {state?.success && <p className="text-sm font-medium text-blue-600">{state.success}</p>}
            {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

            {/* Feedback de reenvio */}
            {resentOk && (
                <p className="text-sm font-medium text-green-600">
                    Um novo link de verificação foi enviado para o seu e-mail.
                </p>
            )}
            {resentError && (
                <p className="text-sm font-medium text-red-600">
                    Não foi possível enviar o e-mail de verificação. Por favor, tente novamente mais tarde.
                </p>
            )}

            {!isVerified && (
                <div className="flex flex-col gap-6 max-w-sm">
                    {email && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                readOnly
                                className="text-gray-400 cursor-default"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleResend}
                            disabled={resendPending || resentOk || pending}
                            className="cursor-pointer"
                        >
                            {resendPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Reenviar e-mail de verificação
                        </Button>

                        <TextLink
                            href="/dashboard/settings/profile"
                            className="text-sm"
                        >
                            Voltar ao perfil
                        </TextLink>
                    </div>
                </div>
            )}

            {/* Após verificação bem-sucedida */}
            {isVerified && (
                <TextLink
                    href="/dashboard/settings/profile"
                    className="text-sm"
                >
                    Voltar ao perfil
                </TextLink>
            )}
        </div>
    );
}
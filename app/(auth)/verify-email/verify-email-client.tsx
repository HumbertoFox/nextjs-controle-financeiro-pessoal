'use client';

import { LoaderCircle } from 'lucide-react';
import { FormEvent, startTransition, useActionState, useEffect } from 'react';
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
    const submit = async (e: FormEvent<HTMLFormElement>) => {
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
                <h1 className="text-xl font-medium">Check email</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Please verify your email address by clicking the link we just sent you.
                </p>
            </div>
            {state?.status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    <p>A new verification link has been sent to the email address you provided during registration.</p>
                </div>
            )}
            {state?.success && <div className="mb-4 text-center text-sm font-medium text-blue-600">{state.success}</div>}
            {state?.error && <div className="mb-4 text-center text-sm font-medium text-red-600">{state.error}</div>}

            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6 mx-auto"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
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
                    disabled={pending || state?.status === 'verification-email-sent' || Boolean(state?.error)}
                    className="cursor-pointer"
                >
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink
                    href={!state?.status ? "/login" : `/login?status=email%20verified&email=${email}`}
                    className="mx-auto block text-sm"
                >
                    Log in
                </TextLink>
            </form>
        </div>
    );
}
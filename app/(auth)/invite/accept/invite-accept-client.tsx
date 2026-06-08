'use client';

import { LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';
import { TextLink } from '@/_components/text-link';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { acceptInvite } from '@/_actions/acceptinvite';
import { InviteAcceptClientProps } from '@/_types';

export default function InviteAcceptClient({ email, token, csrfToken }: InviteAcceptClientProps) {
    const [state, action, pending] = useActionState(acceptInvite, undefined);
    useEffect(() => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('token', token);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    }, [email, token, csrfToken, action]);
    const isAccepted = Boolean(state?.success);

    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <h1 className="text-xl font-medium">Family invite</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Accepting invite for <span className="font-medium text-foreground">{email}</span>.
                </p>
            </div>

            {pending && (
                <div className="flex justify-center">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            )}

            {state?.success && <p className="text-center text-sm font-medium text-blue-600">{state.success}</p>}
            {state?.warning && <p className="text-center text-sm font-medium text-yellow-600">{state.warning}</p>}
            {state?.error && <p className="text-center text-sm font-medium text-red-600">{state.error}</p>}

            <div className="w-full max-w-xs flex flex-col gap-6 mx-auto">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="text-gray-400 cursor-default"
                    />
                </div>

                <TextLink
                    href={isAccepted ? '/dashboard' : '/login'}
                    className="mx-auto block text-sm"
                >
                    {isAccepted ? 'Go to dashboard' : 'Log in'}
                </TextLink>
            </div>
        </div>
    );
}
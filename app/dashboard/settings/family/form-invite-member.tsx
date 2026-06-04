'use client';

import { inviteMember } from '@/_actions/invitemember';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { useActionState } from 'react';

export default function InviteMemberForm({ familyId }: { familyId: string }) {
    const [state, action, pending] = useActionState(inviteMember, undefined);

    return (
        <form action={action} className="flex flex-col gap-4 max-w-sm">
            <input type="hidden" name="familyId" value={familyId} />
            <div className="flex flex-col gap-1">
                <label htmlFor="invite-email" className="text-sm font-medium">
                    Convidar por email
                </label>
                <div className="flex gap-2">
                    <input
                        id="invite-email"
                        name="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        className="border rounded px-3 py-2 text-sm flex-1"
                    />
                    <Button
                        variant="default"
                        type="submit"
                        disabled={pending}
                    >
                        {pending ? 'Enviando...' : 'Convidar'}
                    </Button>
                </div>
                {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
            </div>
            {state?.warning && <p className="text-xs text-orange-500">{state.warning}</p>}
            {state?.message && <p className="text-xs text-green-500">{state.message}</p>}
        </form>
    );
}
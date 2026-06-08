'use client';

import { useActionState } from 'react';
import { removeFamilyMember } from '@/_actions/removefamilymember';
import { Button } from '@/_components/ui/button';

interface RemoveMemberButtonProps {
    memberId: string;
    familyId: string;
    csrfToken?: string;
}

export default function RemoveMemberButton({ memberId, familyId, csrfToken }: RemoveMemberButtonProps) {
    const [state, action, pending] = useActionState(removeFamilyMember, undefined);

    return (
        <form action={action}>
            <input type="hidden" name="memberId" value={memberId} />
            <input type="hidden" name="familyId" value={familyId} />
            <input type="hidden" name="csrfToken" value={csrfToken} />
            {state?.warning && <p className="text-xs text-orange-500">{state.warning}</p>}
            <Button
                type="submit"
                variant="destructive"
                disabled={pending}
            >
                {pending ? 'Removendo...' : 'Remover'}
            </Button>
        </form>
    );
}
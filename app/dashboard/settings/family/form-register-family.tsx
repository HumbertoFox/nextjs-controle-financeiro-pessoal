'use client';

import { createFamily } from '@/_actions/createfamily';
import { InputError } from '@/_components/input-error';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { useActionState } from 'react';

export default function CreateFamilyForm({ csrfToken, userId }: { csrfToken?: string; userId: string }) {
    const [state, action, pending] = useActionState(createFamily, undefined);

    return (
        <form
            action={action}
            className="space-y-6"
        >
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-2">
                <Label htmlFor="family-name">Nome da família</Label>
                <Input
                    id="family-name"
                    name="name"
                    type="text"
                    placeholder="Ex: Família Sales"
                />
                {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
            </div>
            {state?.warning && <p className="text-xs text-orange-500">{state.warning}</p>}
            {state?.message && <p className="text-xs text-green-500">{state.message}</p>}
            <button
                type="submit"
                disabled={pending}
                className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
                {pending ? 'Criando...' : 'Criar família'}
            </button>
        </form>
    );
}
'use client';

import { ChangeEvent, startTransition, SubmitEvent, useActionState, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createAccountAction } from '@/_actions/createaccount';
import { AccountType, accountTypeLabel } from '@/_types';
import { InputError } from './input-error';

export function DialogAddAccount() {
    const [open, setOpen] = useState(false);
    const [state, action, pending] = useActionState(createAccountAction, undefined);
    const [data, setData] = useState({ name: '', type: '', initialBalance: 0 });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => action(formData));
    }
    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ Conta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Nova conta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            autoComplete="name"
                            value={data.name}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="Ex: Nubank"
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                            required
                            value={data.type}
                            onValueChange={(value: AccountType) => setData((prev) => ({ ...prev, type: value }))}
                            disabled={pending}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(accountTypeLabel).map(([value, label]) => (
                                    <SelectItem
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.type?.[0] && <InputError message={state.errors.type[0]} />}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="initialBalance">Saldo inicial (R$)</Label>
                        <Input
                            id="initialBalance"
                            name="initialBalance"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.initialBalance}
                            onChange={handleChange}
                            disabled={pending}
                            required
                        />
                        {state?.errors?.initialBalance?.[0] && <InputError message={state.errors.initialBalance[0]} />}
                    </div>

                    {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
                    {state?.success && <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>}

                    <Button
                        type="submit"
                        disabled={pending}
                    >
                        {pending ? 'Salvando...' : 'Criar conta'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
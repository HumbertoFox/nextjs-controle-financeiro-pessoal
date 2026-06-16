'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createAccountAction } from '@/_actions/createaccount';

const ACCOUNT_TYPES = [
    { value: 'CURRENT', label: 'Conta corrente' },
    { value: 'SAVINGS', label: 'Poupança' },
    { value: 'CREDIT', label: 'Cartão de crédito' },
    { value: 'INVESTMENT', label: 'Investimento' },
    { value: 'DIGITAL', label: 'Conta digital' },
] as const;

export function DialogAddAccount({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createAccountAction(fd);
            if (result?.error) { setError(result.error); return; }
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ Conta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Nova conta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    <input type="hidden" name="userId" value={userId} />

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" name="name" placeholder="Ex: Nubank" required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="type">Tipo</Label>
                        <Select name="type" required>
                            <SelectTrigger id="type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                                {ACCOUNT_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="initialBalance">Saldo inicial (R$)</Label>
                        <Input id="initialBalance" name="initialBalance" type="number" min="0" step="0.01" defaultValue="0" required />
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Salvando...' : 'Criar conta'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
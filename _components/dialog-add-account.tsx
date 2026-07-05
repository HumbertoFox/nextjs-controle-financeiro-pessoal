'use client';

import { ChangeEvent, startTransition, SubmitEvent, useActionState, useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createAccountAction } from '@/_actions/createaccount';
import { AccountType, accountTypeLabel } from '@/_types';
import { InputError } from './input-error';

const initialData = {
    name: '',
    type: '' as AccountType | '',
    initialBalance: 0,
};

export function DialogAddAccount() {
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [state, action, pending] = useActionState(createAccountAction, undefined);
    const [data, setData] = useState(initialData);
    const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({});

    useEffect(() => {
        if (state?.success) {
            setData(initialData);
            formRef.current?.reset();
        }
    }, [state]);
    useEffect(() => {
        if (!state) return;
        setFeedback({ error: state.error, success: state.success });
        const timer = setTimeout(() => setFeedback({}), 3000);

        return () => clearTimeout(timer);
    }, [state]);
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
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >
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
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Select
                                    name="type"
                                    required
                                    value={data.type}
                                    onValueChange={(value: AccountType) => setData((prev) => ({ ...prev, type: value }))}
                                    disabled={pending}
                                >
                                    <SelectTrigger id="type" className="w-full">
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
                            </div>
                            {data.type && (
                                <button
                                    type="button"
                                    onClick={() => setData((prev) => ({ ...prev, type: '' }))}
                                    disabled={pending}
                                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    aria-label="Limpar tipo"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
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
                            value={data.initialBalance || ''}
                            onChange={handleChange}
                            disabled={pending}
                            required
                        />
                        {state?.errors?.initialBalance?.[0] && <InputError message={state.errors.initialBalance[0]} />}
                    </div>

                    {feedback.error && <p className="text-sm text-red-600 dark:text-red-400">{feedback.error}</p>}
                    {feedback.success && <p className="text-sm text-green-600 dark:text-green-400">{feedback.success}</p>}

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
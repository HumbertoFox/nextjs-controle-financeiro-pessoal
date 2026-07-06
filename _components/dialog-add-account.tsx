'use client';

import { ChangeEvent, startTransition, SubmitEvent, useActionState, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
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
    const [state, action, pending] = useActionState(createAccountAction, undefined);
    const [data, setData] = useState(initialData);
    const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({});

    // Função utilitária para limpar a mensagem de sucesso assim que o usuário interagir
    const clearSuccessFeedback = () => {
        setFeedback((prev) => (prev.success ? { ...prev, success: null } : prev));
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, [id]: value }));
    };

    // 1. Monitora o sucesso para resetar o formulário de forma puramente controlada
    useEffect(() => {
        if (state?.success) {
            setData(initialData);
        }
    }, [state]);
    // 2. Controla a exibição e o sumiço automático das mensagens temporárias
    useEffect(() => {
        if (!state) return;
        setFeedback({ error: state.error, success: state.success });

        const timer = setTimeout(() => {
            setFeedback({});
        }, 4000);
        return () => clearTimeout(timer);
    }, [state]);
    // 3. Limpa os feedbacks antigos se o usuário fechar e reabrir o modal manualmente
    useEffect(() => {
        if (!open) {
            setFeedback({});
        }
    }, [open]);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('type', data.type);
        formData.set('initialBalance', String(data.initialBalance));

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
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >

                    {/* Nome */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nome da Conta</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            autoComplete="off"
                            value={data.name}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="Ex: Nubank, Carteira..."
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                    </div>

                    {/* Tipo de Conta */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="type">Tipo</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Select
                                    name="type"
                                    required
                                    value={data.type}
                                    onValueChange={(value: AccountType) => {
                                        clearSuccessFeedback();
                                        setData((prev) => ({ ...prev, type: value }));
                                    }}
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

                    {/* Saldo Inicial */}
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

                    {/* Mensagens de Feedback Estilizadas */}
                    {feedback.error && (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-md border border-red-200 dark:border-red-900 animate-in fade-in">
                            ⚠️ {feedback.error}
                        </p>
                    )}
                    {feedback.success && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 p-2.5 rounded-md border border-green-200 dark:border-green-900 animate-in fade-in">
                            ✅ {feedback.success}
                        </p>
                    )}

                    <Button type="submit" disabled={pending}>
                        {pending ? 'Salvando...' : 'Criar conta'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
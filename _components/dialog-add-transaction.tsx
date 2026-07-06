'use client';

import { ChangeEvent, startTransition, SubmitEvent, useActionState, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createTransactionAction } from '@/_actions/createtransaction';
import { accountTypeLabel, DialogAddTransactionProps, TransactionType, TransactionTypeZod } from '@/_types';
import { InputError } from './input-error';
import { X } from 'lucide-react';

const initialData = {
    type: 'EXPENSE' as TransactionType,
    accountId: '',
    categoryId: '',
    subcategoryId: '',
    subsubcategoryId: '',
    value: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    description: '',
    installmentsTotal: ''
};

export function DialogAddTransaction({ accounts, categories }: DialogAddTransactionProps) {
    const [open, setOpen] = useState(false);
    const [state, action, pending] = useActionState(createTransactionAction, undefined);
    const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({});
    const [data, setData] = useState(initialData);
    const [isInstallment, setIsInstallment] = useState(false);

    const roots = categories.filter((c) => c.depth === 0 && c.type === data.type);
    const selectedRoot = categories.find((c) => c.id === data.categoryId && c.depth === 0);
    const children = selectedRoot
        ? categories.filter((c) => c.parent_id === selectedRoot.id && c.depth === 1)
        : [];
    const selectedChild = categories.find((c) => c.id === data.subcategoryId && c.depth === 1);
    const grandchildren = selectedChild
        ? categories.filter((c) => c.parent_id === selectedChild.id && c.depth === 2)
        : [];
    const finalCategoryId = data.subsubcategoryId || data.subcategoryId || data.categoryId;

    // Função utilitária para limpar a mensagem de sucesso assim que o usuário interagir
    const clearSuccessFeedback = () => {
        setFeedback((prev) => (prev.success ? { ...prev, success: null } : prev));
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, [id]: value }));
    };
    function handleTypeChange(val: TransactionType) {
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, type: val, categoryId: '', subcategoryId: '', subsubcategoryId: '' }));
    }
    function handleCategoryChange(val: string) {
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, categoryId: val, subcategoryId: '', subsubcategoryId: '' }));
    }
    function handleSubcategoryChange(val: string) {
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, subcategoryId: val, subsubcategoryId: '' }));
    }

    // 1. Monitora o sucesso para resetar o formulário
    useEffect(() => {
        if (state?.success) {
            setData(initialData);
            setIsInstallment(false);
        }
    }, [state]);
    // 2. Controla a exibição e o sumiço automático das mensagens
    useEffect(() => {
        if (!state) return;
        setFeedback({ error: state.error, success: state.success });
        //Se o componente desmontar ou um novo estado chegar, o timer anterior é limpo
        const timer = setTimeout(() => {
            setFeedback({});
        }, 4000);

        return () => clearTimeout(timer);
    }, [state]);
    // 3. NOVO: Limpa os feedbacks antigos se o usuário fechar e reabrir o modal manualmente
    useEffect(() => {
        if (!open) {
            setFeedback({});
        }
    }, [open]);
    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        formData.set('accountId', data.accountId);
        formData.set('categoryId', finalCategoryId);
        formData.set('type', data.type);
        formData.set('value', data.value);
        formData.set('transactionDate', data.transactionDate);
        formData.set('description', data.description);
        formData.set('installmentsTotal', isInstallment && data.installmentsTotal ? data.installmentsTotal : '');

        startTransition(async () => action(formData));
    }
    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger asChild>
                <Button size="sm">+ Nova transação</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nova transação</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >
                    {/* Tipo */}
                    <div className="grid grid-cols-2 gap-2">
                        {TransactionTypeZod.map((t) => (
                            <button
                                key={t}
                                type="button"
                                disabled={pending}
                                onClick={() => handleTypeChange(t)}
                                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${data.type === t
                                    ? t === 'EXPENSE'
                                        ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                        : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'border-border text-muted-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {t === 'EXPENSE' ? 'Gasto' : 'Receita'}
                            </button>
                        ))}
                    </div>

                    {/* Conta */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="accountId">Conta</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Select
                                    value={data.accountId}
                                    onValueChange={(value) => {
                                        clearSuccessFeedback();
                                        setData((prev) => ({ ...prev, accountId: value }));
                                    }}
                                    required
                                    disabled={pending}
                                >
                                    <SelectTrigger id="accountId" className="w-full">
                                        <SelectValue placeholder="Selecione a conta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={a.id}
                                            >
                                                {a.name}
                                                <span className="text-muted-foreground"> · {accountTypeLabel[a.type]}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {data.accountId && (
                                <button
                                    type="button"
                                    onClick={() => setData((prev) => ({ ...prev, accountId: '' }))}
                                    disabled={pending}
                                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    aria-label="Limpar conta"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categoria raiz */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Categoria</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Select
                                    value={data.categoryId}
                                    onValueChange={handleCategoryChange}
                                    required
                                    disabled={pending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roots.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {data.categoryId && (
                                <button
                                    type="button"
                                    onClick={() => setData((prev) => ({ ...prev, categoryId: '', subcategoryId: '', subsubcategoryId: '' }))}
                                    disabled={pending}
                                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    aria-label="Limpar categoria"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Subcategoria (nível 1) */}
                    {children.length > 0 && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <Label>Subcategoria</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={data.subcategoryId}
                                        onValueChange={handleSubcategoryChange}
                                        disabled={pending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {children.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.subcategoryId && (
                                    <button
                                        type="button"
                                        onClick={() => setData((prev) => ({ ...prev, subcategoryId: '', subsubcategoryId: '' }))}
                                        disabled={pending}
                                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                        aria-label="Limpar subcategoria"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sub-subcategoria (nível 2) */}
                    {data.subcategoryId && grandchildren.length > 0 && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <Label>Detalhe</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={data.subsubcategoryId}
                                        onValueChange={(value) => {
                                            clearSuccessFeedback();
                                            setData((prev) => ({ ...prev, subsubcategoryId: value }));
                                        }}
                                        disabled={pending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grandchildren.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.subsubcategoryId && (
                                    <button
                                        type="button"
                                        onClick={() => setData((prev) => ({ ...prev, subsubcategoryId: '' }))}
                                        disabled={pending}
                                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                        aria-label="Limpar detalhe"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Valor */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="value">Valor (R$)</Label>
                        <Input
                            id="value"
                            name="value"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0,00"
                            value={data.value}
                            onChange={handleChange}
                            disabled={pending}
                            required
                        />
                        {state?.errors?.value?.[0] && <InputError message={state.errors.value[0]} />}
                    </div>

                    {/* Data */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="transactionDate">Data</Label>
                        <Input
                            id="transactionDate"
                            name="transactionDate"
                            type="date"
                            value={data.transactionDate}
                            onChange={handleChange}
                            disabled={pending}
                            required
                        />
                        {state?.errors?.transactionDate?.[0] && <InputError message={state.errors.transactionDate[0]} />}
                    </div>

                    {/* Opção de Parcelamento */}
                    <label htmlFor="isInstallment" className="flex items-center gap-2 py-1 cursor-pointer select-none text-sm">
                        <input
                            type="checkbox"
                            id="isInstallment"
                            checked={isInstallment}
                            onChange={(e) => {
                                clearSuccessFeedback();
                                setIsInstallment(e.target.checked);
                                if (!e.target.checked) setData((prev) => ({ ...prev, installmentsTotal: '' }));
                            }}
                            disabled={pending}
                            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Esta transação é parcelada
                    </label>

                    {/* Campo dinâmico do número de parcelas */}
                    {isInstallment && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <Label htmlFor="installmentsTotal">Quantidade de Parcelas</Label>
                            <Input
                                id="installmentsTotal"
                                name="installmentsTotal"
                                type="number"
                                min="2"
                                max="72"
                                step="1"
                                placeholder="Ex: 2"
                                value={data.installmentsTotal}
                                onChange={handleChange}
                                disabled={pending}
                                required={isInstallment}
                            />
                        </div>
                    )}

                    {/* Descrição */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="description">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Ex: almoço com cliente"
                            value={data.description}
                            onChange={handleChange}
                            disabled={pending}

                        />
                        {state?.errors?.description?.[0] && <InputError message={state.errors.description[0]} />}
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

                    <Button
                        type="submit"
                        disabled={pending}
                        className="mt-1"
                    >
                        {pending ? 'Salvando...' : 'Salvar transação'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createTransactionAction } from '@/_actions/createtransaction';
import { DialogAddTransactionProps, TransactionType, TransactionTypeZod } from '@/_types';

export function DialogAddTransaction({ accounts, categories }: DialogAddTransactionProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [categoryId, setCategoryId] = useState('');

    // filtra raízes pelo tipo selecionado
    const roots = categories.filter((c) => c.depth === 0 && c.type === type);

    // filtra filhos da categoria selecionada (depth 1)
    const selectedRoot = categories.find((c) => c.id === categoryId && c.depth === 0);
    const children = selectedRoot
        ? categories.filter((c) => c.parent_id === selectedRoot.id && c.depth === 1)
        : [];

    const [subcategoryId, setSubcategoryId] = useState('');
    const selectedChild = categories.find((c) => c.id === subcategoryId && c.depth === 1);
    const grandchildren = selectedChild
        ? categories.filter((c) => c.parent_id === selectedChild.id && c.depth === 2)
        : [];

    const [subsubcategoryId, setSubsubcategoryId] = useState('');

    // ID final para gravar: o mais profundo selecionado
    const finalCategoryId = subsubcategoryId || subcategoryId || categoryId;

    function handleTypeChange(val: TransactionType) {
        setType(val);
        setCategoryId('');
        setSubcategoryId('');
        setSubsubcategoryId('');
    }

    function handleCategoryChange(val: string) {
        setCategoryId(val);
        setSubcategoryId('');
        setSubsubcategoryId('');
    }

    function handleSubcategoryChange(val: string) {
        setSubcategoryId(val);
        setSubsubcategoryId('');
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set('categoryId', finalCategoryId);
        fd.set('type', type);

        startTransition(async () => {
            const result = await createTransactionAction(fd);
            if (result?.error) { setError(result.error); return; }
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">+ Nova transação</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nova transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    {/* Tipo */}
                    <div className="grid grid-cols-2 gap-2">
                        {TransactionTypeZod.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleTypeChange(t)}
                                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${type === t
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
                        <Select name="accountId" required>
                            <SelectTrigger id="accountId"><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Categoria raiz */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Categoria</Label>
                        <Select value={categoryId} onValueChange={handleCategoryChange} required>
                            <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                            <SelectContent>
                                {roots.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subcategoria (nível 1) */}
                    {children.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Subcategoria</Label>
                            <Select value={subcategoryId} onValueChange={handleSubcategoryChange}>
                                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                                <SelectContent>
                                    {children.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Sub-subcategoria (nível 2) */}
                    {grandchildren.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Detalhe</Label>
                            <Select value={subsubcategoryId} onValueChange={setSubsubcategoryId}>
                                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                                <SelectContent>
                                    {grandchildren.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Valor */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="value">Valor (R$)</Label>
                        <Input id="value" name="value" type="number" min="0.01" step="0.01" placeholder="0,00" required />
                    </div>

                    {/* Data */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="transactionDate">Data</Label>
                        <Input
                            id="transactionDate"
                            name="transactionDate"
                            type="date"
                            defaultValue={new Date().toISOString().slice(0, 10)}
                            required
                        />
                    </div>

                    {/* Descrição */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="description">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input id="description" name="description" placeholder="Ex: almoço com cliente" />
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <Button type="submit" disabled={isPending} className="mt-1">
                        {isPending ? 'Salvando...' : 'Salvar transação'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
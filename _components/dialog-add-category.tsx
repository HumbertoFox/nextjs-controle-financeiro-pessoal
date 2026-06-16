'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createCategoryAction } from '@/_actions/createcategory';
import { DialogAddCategoryProps, TransactionType, TransactionTypeZod } from '@/_types';

export function DialogAddCategory({ userId, categories }: DialogAddCategoryProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [parentId, setParentId] = useState('');
    const [subParentId, setSubParentId] = useState('');

    // nível 0 filtrado por tipo
    const roots = categories.filter((c) => c.depth === 0 && c.type === type);
    // nível 1 filhos do root selecionado
    const children = parentId
        ? categories.filter((c) => c.parent_id === parentId && c.depth === 1)
        : [];

    // parent final = sub-subcategoria se selecionada, senão subcategoria, senão raiz
    const finalParentId = subParentId || parentId || null;
    // depth da nova categoria = profundidade do pai + 1 (máximo 2)
    const parentDepth = subParentId ? 2 : parentId ? 1 : 0;
    const isLeafLevel = parentDepth >= 2;

    function handleTypeChange(val: TransactionType) {
        setType(val);
        setParentId('');
        setSubParentId('');
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set('type', type);
        if (finalParentId) fd.set('parentId', finalParentId);

        startTransition(async () => {
            const result = await createCategoryAction(fd);
            if (result?.error) { setError(result.error); return; }
            setOpen(false);
        });
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ Categoria</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Nova categoria</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    <input type="hidden" name="userId" value={userId} />

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

                    {/* Categoria pai (opcional) */}
                    {roots.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Categoria pai <span className="text-muted-foreground">(opcional)</span></Label>
                            <Select
                                value={parentId}
                                onValueChange={(v) => { setParentId(v); setSubParentId(''); }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Criar como categoria raiz" />
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
                    )}

                    {/* Subcategoria pai (nível 1 → criar no nível 2) */}
                    {children.length > 0 && !isLeafLevel && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Subcategoria pai <span className="text-muted-foreground">(opcional)</span></Label>
                            <Select
                                value={subParentId}
                                onValueChange={setSubParentId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Criar no nível anterior" />
                                </SelectTrigger>
                                <SelectContent>
                                    {children.map((c) => (
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
                    )}

                    {/* Nome */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Transporte"
                            required
                        />
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <Button
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? 'Salvando...' : 'Criar categoria'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
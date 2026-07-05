'use client';

import { ChangeEvent, startTransition, useActionState, useState, useEffect, useRef, SubmitEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/_components/ui/dialog';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_components/ui/select';
import { createCategoryAction } from '@/_actions/createcategory';
import { DialogAddCategoryProps, TransactionType, TransactionTypeZod } from '@/_types';
import { InputError } from './input-error';
import { X } from 'lucide-react';

const initialData = {
    type: 'EXPENSE' as TransactionType,
    parentId: '',
    subParentId: '',
    name: '',
};

export function DialogAddCategory({ categories }: DialogAddCategoryProps) {
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [state, action, pending] = useActionState(createCategoryAction, undefined);
    const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({});
    const [data, setData] = useState(initialData);

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

    const roots = categories.filter((c) => !c.parent_id && c.type === data.type);
    const children = data.parentId
        ? categories.filter((c) => c.parent_id === data.parentId)
        : [];
    const finalParentId = data.subParentId || data.parentId || null;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    function handleTypeChange(val: TransactionType) {
        setData((prev) => ({ ...prev, type: val, parentId: '', subParentId: '' }));
    }

    function handleParentChange(val: string) {
        setData((prev) => ({ ...prev, parentId: val, subParentId: '' }));
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set('type', data.type);
        formData.set('name', data.name);

        if (finalParentId) formData.set('parentId', finalParentId);
        startTransition(async () => action(formData));
    }
    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ Categoria</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Nova categoria</DialogTitle>
                </DialogHeader>
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >

                    {/* Tipo (Gasto / Receita) */}
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

                    {/* Categoria Pai (Nível 0) */}
                    {roots.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Categoria pai <span className="text-muted-foreground">(opcional)</span></Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={data.parentId}
                                        onValueChange={handleParentChange}
                                        disabled={pending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Criar como categoria raiz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roots.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.parentId && (
                                    <button
                                        type="button"
                                        onClick={() => setData((prev) => ({ ...prev, parentId: '', subParentId: '' }))}
                                        disabled={pending}
                                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                        aria-label="Limpar categoria pai"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Subcategoria Pai (Nível 1) */}
                    {children.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Subcategoria pai <span className="text-muted-foreground">(opcional)</span></Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={data.subParentId}
                                        onValueChange={(value) => setData((prev) => ({ ...prev, subParentId: value }))}
                                        disabled={pending}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Criar no nível anterior" />
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
                                {data.subParentId && (
                                    <button
                                        type="button"
                                        onClick={() => setData((prev) => ({ ...prev, subParentId: '' }))}
                                        disabled={pending}
                                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                        aria-label="Limpar subcategoria pai"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nome */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Transporte"
                            value={data.name}
                            onChange={handleChange}
                            required
                            disabled={pending}
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                    </div>

                    {/* Mensagens de Feedback */}
                    {feedback.error && <p className="text-sm text-red-600 dark:text-red-400">{feedback.error}</p>}
                    {feedback.success && <p className="text-sm text-green-600 dark:text-green-400">{feedback.success}</p>}

                    <Button
                        type="submit"
                        disabled={pending}
                    >
                        {pending ? 'Salvando...' : 'Criar categoria'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
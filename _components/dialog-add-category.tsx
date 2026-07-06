'use client';

import { ChangeEvent, startTransition, useActionState, useState, useEffect, useRef, SubmitEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
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
    const [state, action, pending] = useActionState(createCategoryAction, undefined);
    const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({});
    const [data, setData] = useState(initialData);
    const roots = categories.filter((c) => !c.parent_id && c.type === data.type);
    const children = data.parentId
        ? categories.filter((c) => c.parent_id === data.parentId)
        : [];
    const finalParentId = data.subParentId || data.parentId || null;

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
        setData((prev) => ({ ...prev, type: val, parentId: '', subParentId: '', name: '' }));
    }
    function handleParentChange(val: string) {
        clearSuccessFeedback();
        setData((prev) => ({ ...prev, parentId: val, subParentId: '' }));
    }

    // 1. Monitora o sucesso para resetar o formulário (Mantendo apenas o estado controlado)
    useEffect(() => {
        if (state?.success) {
            // Preserva o tipo selecionado (Gasto/Receita) e a árvore de pais atual 
            // para agilizar se ele estiver criando subcategorias na sequência.
            setData((prev) => ({
                ...prev,
                name: '', // Limpa apenas o nome cadastrado
            }));
        }
    }, [state]);

    // 2. Controla a exibição e o sumiço automático das mensagens
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
        formData.set('type', data.type);
        formData.set('name', data.name);

        if (finalParentId) {
            formData.set('parentId', finalParentId);
        }
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
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
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
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <Label>Subcategoria pai <span className="text-muted-foreground">(opcional)</span></Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={data.subParentId}
                                        onValueChange={(value) => {
                                            clearSuccessFeedback();
                                            setData((prev) => ({ ...prev, subParentId: value }));
                                        }}
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
                        <Label htmlFor="name">Nome da Categoria</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Transporte, Alimentação..."
                            value={data.name}
                            onChange={handleChange}
                            required
                            disabled={pending}
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
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
                        {pending ? 'Salvando...' : 'Criar categoria'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
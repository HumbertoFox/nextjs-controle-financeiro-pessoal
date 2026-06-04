'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Eye, EyeClosed } from 'lucide-react';
import { deleteUser } from '@/_actions/deleteuser';
import { useRouter } from 'next/navigation';
import { InputError } from '@/_components/input-error';

export default function DeleteUser({ csrfToken }: { csrfToken?: string; }) {
    const router = useRouter();
    const passwordInput = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(deleteUser, undefined);
    const [showPassword, setshowPassword] = useState<boolean>(false);
    const [data, setData] = useState<{ password: string }>({ password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const toggleShowPassword = () => setshowPassword(!showPassword);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('password', data.password);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    const handleClose = () => setData({ password: '' });

    useEffect(() => {
        if (state?.message) {
            router.push('/logout');
        };
    }, [state?.message, router]);
    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-2 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Aviso</p>
                    <p className="text-sm">Proceda com cautela, esta ação é irreversível.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Excluir conta</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Tem certeza de que deseja excluir sua conta?</DialogTitle>
                        <DialogDescription>
                            Após excluir sua conta, todos os seus recursos e dados também serão excluídos permanentemente. Digite sua senha para confirmar que deseja excluir sua conta permanentemente.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={submit}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        autoComplete="off"
                                        type={showPassword ? "text" : "password"}
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        title={showPassword ? "Hide password" : "Show password"}
                                        onClick={toggleShowPassword}
                                        className="btn-icon-toggle"
                                    >
                                        {showPassword ? <Eye /> : <EyeClosed />}
                                    </button>
                                </div>
                                {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={handleClose}
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={pending}
                                    aria-busy={pending}
                                >
                                    Excluir conta
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
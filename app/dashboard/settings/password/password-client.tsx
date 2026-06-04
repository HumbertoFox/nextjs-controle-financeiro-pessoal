'use client';

import { InputError } from '@/_components/input-error';
import { Transition } from '@headlessui/react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Eye, EyeClosed } from 'lucide-react';
import { updatePassword } from '@/_actions/updatepassword';
import { csrfTokenProps } from '@/_types';
import { PasswordChecklist } from '@/_components/password-checklist';

export default function PasswordPageClient({ csrfToken }: csrfTokenProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(updatePassword, undefined);
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [recentlySuccessful, setrecentlySuccessful] = useState<boolean>(false);
    const [data, setData] = useState({ current_password: '', password: '', password_confirmation: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const toggleShowOldPassword = () => setShowOldPassword(!showOldPassword);
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };

    useEffect(() => {
        if (!state?.message) return;

        startTransition(() => setrecentlySuccessful(true));

        const timeout = setTimeout(() => {
            setrecentlySuccessful(false);
            setData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
            currentPasswordInput.current?.focus();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [state?.message]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Atualizar senha</h2>
                    <p className="text-muted-foreground text-sm">Certifique-se de que sua conta utilize uma senha longa e aleatória para garantir sua segurança.</p>
                </div>
                <form
                    onSubmit={submit}
                    className="space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Senha atual</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                name="current_password"
                                autoComplete="off"
                                tabIndex={1}
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={handleChange}
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Senha atual"
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showOldPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={toggleShowOldPassword}
                                className="btn-icon-toggle"
                            >
                                {showOldPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.current_password?.[0] && <InputError message={state.errors.current_password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                tabIndex={2}
                                ref={passwordInput}
                                value={data.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Nova Senha"
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={toggleShowPassword}
                                className="btn-icon-toggle"
                            >
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        <PasswordChecklist password={data.password} />
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirme sua nova senha.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="off"
                                tabIndex={3}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                type={showPasswordConfirm ? "text" : "password"}
                                placeholder="Confirme sua nova senha."
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPasswordConfirm ? "Ocultar senha" : "Mostrar senha"}
                                onClick={toggleShowPasswordConfirm}
                                className="btn-icon-toggle"
                            >
                                {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            tabIndex={4}
                            disabled={pending}
                        >
                            Salvar senha
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Salvo</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </>
    );
}

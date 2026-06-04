'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '@/_actions/resetpassword';
import { csrfTokenProps, ResetPasswordForm } from '@/_types';
import { TextLink } from '@/_components/text-link';
import { PasswordChecklist } from '@/_components/password-checklist';

export default function ResetPasswordClient({ csrfToken }: csrfTokenProps) {
    const searchParams = useSearchParams();
    const [state, action, pending] = useActionState(resetPassword, undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<ResetPasswordForm>({ token: searchParams.get('token') ?? '', password: '', password_confirmation: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
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

        startTransition(() => {
            setData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        });
    }, [state]);
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <h1 className="text-xl font-medium">Reset password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Please enter your new password below.
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6 mx-auto"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="token">Token</Label>
                        <Input
                            id="token"
                            type="text"
                            name="token"
                            tabIndex={1}
                            value={data.token}
                            readOnly
                            required
                            className="block w-full cursor-default"
                        />
                        {state?.errors?.token?.[0] && <InputError message={state.errors.token[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                type={showPassword ? "text" : "password"}
                                tabIndex={2}
                                value={data.password}
                                className="block w-full"
                                autoFocus
                                onChange={handleChange}
                                placeholder="Password"
                                required
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
                        <PasswordChecklist password={data.password} />
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm your password.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="off"
                                type={showPasswordConfirm ? "text" : "password"}
                                tabIndex={3}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPasswordConfirm ? "Hide password" : "Show password"}
                                onClick={toggleShowPasswordConfirm}
                                className="btn-icon-toggle"
                            >
                                {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                    </div>

                    <Button
                        type="submit"
                        disabled={pending}
                        className="mt-4 w-full"
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>

            {state?.message && <p className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</p>}
            {state?.warning && <p className="mb-4 text-center text-sm font-medium text-red-600">{state.warning}</p>}

            {state?.message && (
                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>go back to</span>
                    <TextLink href="/login">Log in</TextLink>
                </div>
            )}
        </div>
    );
}

'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { ChangeEvent, startTransition, SubmitEvent, useActionState, useRef, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { createAdmin } from '@/_actions/createadmin';
import { TextLink } from '@/_components/text-link';
import { handleImageChange } from '@/_lib/handleimagechange';
import Image from 'next/image';
import { RegisterFormProps } from '@/_types';
import { PasswordChecklist } from '@/_components/password-checklist';
import Link from 'next/link';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

export default function RegisterAdminClient({ TitleIntl, csrfToken }: { TitleIntl: string; csrfToken?: string; }) {
    const emailRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(createAdmin, undefined);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<RegisterFormProps>({ name: '', email: '', password: '', password_confirmation: '', avatar: undefined });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const onImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const { file, preview, error } = await handleImageChange(e);
        setImageFile(file);
        setImagePreview(preview);
        setImageError(error);
    };
    const toggleShowPassword = () => setShowPassword(prev => !prev);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(prev => !prev);
    const submit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (imageError) return;
        const formData = new FormData(e.currentTarget);
        if (imageFile) formData.append('file', imageFile);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    return (
        <div className="space-y-6 w-full py-2 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <Link
                    href="/"
                    className="size-16 dark:invert 2xl:hidden rounded-full"
                >
                    <AppLogoIconSvg className="rounded-full" />
                </Link>
                <h1 className="text-xl font-medium">{TitleIntl}</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Insira seus dados abaixo para criar sua conta.
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full max-w-80 flex flex-col gap-6 mx-auto"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="file"
                            className="mx-auto"
                        >
                            Foto de perfil &#40;opcional&#41;
                        </Label>
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview avatar"
                                        width={512}
                                        height={512}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-50">
                                        Sem imagem
                                    </div>
                                )}
                            </div>

                            <Label
                                htmlFor="file"
                                title={imageError ? "Clique em Selecionar imagem e depois em Cancelar." : "Selecione a foto do perfil"}
                                className="cursor-pointer px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                            >
                                Selecione a imagem
                            </Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                tabIndex={1}
                                accept="image/jpeg, image/png, image/webp"
                                onChange={onImageChange}
                                disabled={pending}
                                className="hidden"
                            />
                            {imageError && <InputError message={imageError} />}
                            {state?.errors?.avatar?.[0] && <InputError message={state.errors.avatar[0]} />}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={2}
                            autoComplete="name"
                            value={data.name}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="Nome completo"
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Endereço de email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="email@exemplo.com"
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={4}
                                value={data.password}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="Senha"
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
                        <Label htmlFor="password_confirmation">Confirme sua senha.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="off"
                                type={showPasswordConfirm ? "text" : "password"}
                                required
                                tabIndex={5}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="Confirme sua senha."
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

                    <Button
                        type="submit"
                        tabIndex={6}
                        disabled={pending || Boolean(imageError)}
                        aria-busy={pending || Boolean(imageError)}
                        className="mt-2 w-full"
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Criar uma conta
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        Você já tem uma conta!&nbsp;&nbsp;
                        <TextLink href="/login" tabIndex={7}>
                            Conecte-se
                        </TextLink>
                    </div>
                </div>
            </form>

            {state?.warning && <p className="mb-4 text-center text-sm font-medium text-orange-400">{state.warning}</p>}
        </div>
    );
}
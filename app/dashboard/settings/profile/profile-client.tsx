'use client';

import { Transition } from '@headlessui/react';
import { startTransition, useActionState, useEffect, useState } from 'react';
import DeleteUser from '@/_components/delete-user';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { updateUser } from '@/_actions/updateuser';
import { emailVerifiedChecked } from '@/_actions/emailverified';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { handleImageChange } from '@/_lib/handleimagechange';
import { ProfileForm, ProfileFormClientProps } from '@/_types';

export function ProfilePageClient({ name, email, avatar, mustVerifyEmail, csrfToken }: ProfileFormClientProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(updateUser, undefined);
    const [imagePreview, setImagePreview] = useState<string | null | undefined>(avatar);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState<boolean>(false);
    const [data, setData] = useState<ProfileForm>({ name: name, email: email, avatar: avatar });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { file, preview, error } = await handleImageChange(e);
        setImageFile(file);
        setImagePreview(preview ?? avatar);
        setImageError(error);
    };
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (imageError) return;
        const formData = new FormData(e.currentTarget);
        if (imageFile) formData.append('file', imageFile);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    const handleVerifildEmail = async () => {
        const result = await emailVerifiedChecked();
        setStatus(result);
        if (result === 'verification-link-sent') {
            setTimeout(() => router.push('/logout'), 3000);
        }
    };
    useEffect(() => {
        if (!state?.success) return;

        startTransition(() => setRecentlySuccessful(true));

        const timeout = setTimeout(() => {
            setRecentlySuccessful(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [state?.success]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Informações do perfil</h2>
                    <p className="text-muted-foreground text-sm">Atualize sua foto, nome e endereço de e-mail.</p>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="flex flex-col-reverse justify-between lg:flex-row gap-6">
                        <div className="min-w-2/3 flex flex-col flex-1 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"
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
                                    className="mt-1 block w-full"
                                    value={data.email ?? ""}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="email@exemplo.com"
                                />
                                {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                            </div>

                            {mustVerifyEmail && (
                                <div>
                                    <p className="text-muted-foreground -mt-4 text-sm">
                                        Seu endereço de e-mail não foi verificado.&nbsp;&nbsp;
                                        <button
                                            type="button"
                                            onClick={handleVerifildEmail}
                                            className="text-foreground underline decoration-neutral-300 cursor-pointer underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Clique aqui para reenviar o e-mail de verificação.
                                        </button>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            Um novo link de verificação foi enviado para o seu endereço de e-mail.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="file"
                                className="mx-auto"
                            >
                                Foto de perfil &#40;opcional&#41;
                            </Label>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative size-40 rounded-full overflow-hidden border border-gray-300">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Visualizar avatar"
                                            width={512}
                                            height={512}
                                            onError={() => setImagePreview(null)}
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
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={pending || Boolean(imageError)}>Salvar</Button>

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

            <DeleteUser
                csrfToken={csrfToken}
            />
        </>
    );
}

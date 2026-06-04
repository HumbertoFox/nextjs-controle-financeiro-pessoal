'use client';

import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { deleteUserById } from '@/_actions/deleteadminuser';
import { reactivateAdminUserById } from '@/_actions/reactivateadminuser';
import { UserLock, UserRoundPen, UserRoundX } from 'lucide-react';
import Link from 'next/link';
import { AdminActionButtonsProps } from '@/_types';

export function AdminActionButtons({ admin, csrfToken, isLoggedAdmin }: AdminActionButtonsProps) {
    if (!admin.deleted_at) {
        return (
            <>
                <Link
                    href={isLoggedAdmin ? '/dashboard/settings/profile' : `/dashboard/admins/${admin.id}/update`}
                    title={`To update ${admin.name}`}
                >
                    <UserRoundPen
                        aria-label={`To update ${admin.name}`}
                        className="size-5 text-yellow-600 hover:text-yellow-500 duration-300"
                    />
                </Link>

                {!isLoggedAdmin && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" title={`Delete ${admin.name}`}>
                                <UserRoundX
                                    aria-label={`Delete ${admin.name}`}
                                    className="size-5 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                                />
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Tem certeza?</DialogTitle>
                            <DialogDescription>
                                Após a confirmação, o usuário administrador {admin.name} não poderá mais acessar o sistema!
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <form action={deleteUserById}>
                                    <input type="hidden" name="csrfToken" value={csrfToken} />
                                    <input type="hidden" name="userId" value={admin.id} />
                                    <Button type="submit" variant="destructive">Sim, excluir!</Button>
                                </form>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    title={`Activate ${admin.name}`}
                    className="cursor-pointer"
                >
                    <UserLock
                        aria-label={`Activate ${admin.name}`}
                        className="size-5 text-red-600 hover:text-green-500 duration-300"
                    />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    After confirmation, you will activate the admin user account {admin.name}!
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="destructive"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <form action={reactivateAdminUserById}>
                        <input
                            type="hidden"
                            name="csrfToken"
                            value={csrfToken}
                        />
                        <input
                            type="hidden"
                            name="userId"
                            value={admin.id}
                        />
                        <Button
                            type="submit"
                            variant="outline"
                        >
                            Yes, activate!
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
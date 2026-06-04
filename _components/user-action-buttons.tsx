'use client';

import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { deleteUserById } from '@/_actions/deleteadminuser';
import { reactivateAdminUserById } from '@/_actions/reactivateadminuser';
import { UserLock, UserPen, UserX } from 'lucide-react';
import Link from 'next/link';
import { UserActionButtonsProps } from '@/_types';

export function UserActionButtons({ user, csrfToken }: UserActionButtonsProps) {
    if (!user.deleted_at) {
        return (
            <>
                <Link
                    href={`/dashboard/admins/${user.id}/update`}
                    title={`To update ${user.name}`}
                >
                    <UserPen
                        aria-label={`To update ${user.name}`}
                        className="size-5 text-yellow-600 hover:text-yellow-500 duration-300"
                    />
                </Link>

                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button" title={`Delete ${user.name}`}>
                            <UserX
                                aria-label={`Delete ${user.name}`}
                                className="size-5 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                            />
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Tem certeza?</DialogTitle>
                        <DialogDescription>
                            Após a confirmação, o usuário {user.name} não poderá mais acessar o sistema!
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
                                <input
                                    type="hidden"
                                    name="csrfToken"
                                    value={csrfToken}
                                />
                                <input
                                    type="hidden"
                                    name="userId"
                                    value={user.id}
                                />
                                <Button
                                    type="submit"
                                    variant="destructive"
                                >
                                    Sim, excluir!
                                </Button>
                            </form>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    title={`Activate ${user.name}`}
                    className="cursor-pointer"
                >
                    <UserLock
                        aria-label={`Activate ${user.name}`}
                        className="size-5 text-red-600 hover:text-green-500 duration-300"
                    />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    After confirmation, you will activate the user account {user.name}!
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
                            value={user.id}
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
'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingForgotPassword() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="mx-auto flex w-full flex-col items-center gap-8 sm:w-72">

                <div className="grid gap-2">
                    <Skeleton className="size-16 2xl:hidden rounded-full mx-auto mb-4" />
                    <Skeleton className="w-52 h-5 mx-auto" />
                    <Skeleton className="w-88 h-3.5" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="w-28 h-3.5" />
                    <Skeleton className="w-88 h-9" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="w-88 h-9" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="w-36 h-5 mx-auto" />
                </div>
            </div>
        </div>
    );
}
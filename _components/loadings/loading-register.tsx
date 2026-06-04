'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingRegister() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-72">
                <div className="grid justify-items-center gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3.5 w-2xs" />
                </div>

                <div className="grid justify-items-center gap-4">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="size-24 rounded-full" />
                    <Skeleton className="h-9 w-28" />
                </div>

                <div className="grid gap-2 mb-6">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-25" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="grid justify-items-center gap-6 pt-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-3.5 w-48" />
                </div>
            </div>
        </div>
    );
}
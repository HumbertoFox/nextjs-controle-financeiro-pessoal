'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingResetPassword() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="flex w-full flex-col items-center gap-6 sm:w-72 mx-auto">
                <Skeleton className="size-16 2xl:hidden rounded-full" />

                <div className="w-full grid gap-2">
                    <Skeleton className="h-5 w-36 mx-auto" />
                    <Skeleton className="h-3.5 w-60 mx-auto" />
                </div>

                <div className="w-full grid gap-2">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="w-full grid gap-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="w-full grid gap-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <Skeleton className="h-9 w-full mt-4" />
            </div>
        </div>
    );
}
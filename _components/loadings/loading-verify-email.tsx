'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingVerifyEmail() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="flex w-full flex-col items-center gap-6 sm:w-96 mx-auto">
                <Skeleton className="size-16 2xl:hidden rounded-full mx-auto" />

                <div className="w-full grid gap-2">
                    <Skeleton className="h-5 w-44 mx-auto" />
                    <Skeleton className="h-3.5 w-full" />
                </div>

                <div className="w-full max-w-72 flex flex-col items-center gap-6">
                    <div className="w-full grid gap-2">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>

                    <div className="w-full grid gap-2">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>

                    <Skeleton className="h-9 w-full" />

                    <Skeleton className="h-3.5 w-16" />
                </div>
            </div>
        </div>
    );
}
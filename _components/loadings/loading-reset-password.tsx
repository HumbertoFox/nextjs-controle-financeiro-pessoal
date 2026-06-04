'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingResetPassword() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 w-full 2xl:w-2/4 max-[1440px] min-h-screen space-y-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="grid justify-items-center gap-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3.5 w-80" />
            </div>

            <div className="grid gap-6 space-y-2">
                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-9 w-96" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-9 w-96" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-9 w-96" />
                </div>

                <div className="grid gap-2">
                    <Skeleton className="h-9 w-96" />
                </div>
            </div>
        </div>
    );
}
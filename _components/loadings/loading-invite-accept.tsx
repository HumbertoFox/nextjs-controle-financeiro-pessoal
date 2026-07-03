'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingInviteAccept() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="mx-auto flex w-full flex-col items-center gap-6 sm:w-72">
                <Skeleton className="size-16 2xl:hidden rounded-full mx-auto" />
                
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-3.5 w-36" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-3.5 w-14 mr-auto" />
                        <Skeleton className="h-9 w-80" />
                    </div>

                    <Skeleton className="h-3.5 w-20" />
                </div>
            </div>
        </div>
    );
}
'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingInviteAccept() {
    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-44" />
            </div>

            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-3.5 w-14 mr-auto" />
                <Skeleton className="h-9 w-80" />
            </div>
        </div>
    );
}
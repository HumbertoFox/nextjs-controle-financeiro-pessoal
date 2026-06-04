'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingSettings() {
    return (
        <>
            <div className="flex flex-1 gap-4">
                <Skeleton className="size-40 rounded-full" />
                <div className="flex flex-col justify-center gap-2">
                    <Skeleton className="w-80 h-5" />
                    <Skeleton className="w-72 h-9" />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="w-64 h-5" />
                        <Skeleton className="size-6 rounded-full" />
                    </div>
                    <Skeleton className="w-44 h-5" />
                </div>
            </div>
            <div className="space-y-4 pt-2">
                <Skeleton className="w-60 h-6" />
                <Skeleton className="w-64 h-6" />
            </div>
        </>
    );
}
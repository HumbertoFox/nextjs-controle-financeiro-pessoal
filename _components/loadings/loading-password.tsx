'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingPassword() {
    return (
        <div className="space-y-6">
            <div className="mb-8 my-1 space-y-0.5">
                <Skeleton className="w-48 h-7" />
                <Skeleton className="w-72 h-5" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-32 h-3.5" />
                <Skeleton className="w-full h-9" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-28 h-3.5" />
                <Skeleton className="w-full h-9" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-48 h-3.5" />
                <Skeleton className="w-full h-9" />
            </div>
            <Skeleton className="w-32 h-10" />
        </div>
    );
}
'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingAppearance() {
    return (
        <div className="space-y-6">
            <div className="mb-8 my-1 space-y-0.5">
                <Skeleton className="w-48 h-7" />
                <Skeleton className="w-72 h-5" />
            </div>
            <Skeleton className="w-64 h-10" />
        </div>
    );
}
'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingSettingsVerifyEmail() {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="grid gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3.5 w-72" />
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-3.5 w-24" />
                </div>
            </div>
        </>
    );
}
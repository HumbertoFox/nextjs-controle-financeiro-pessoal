'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingSettingsProfile() {
    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-4">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3.5 w-72" />
                    </div>

                    <div className="space-y-6 pb-6">
                        <div className="grid gap-2">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-9 w-full" />
                        </div>

                        <div className="grid gap-2">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                        <Skeleton className="h-9 w-16" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-72" />
                        <div className="space-y-4 rounded-lg border p-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-64" />
                            <Skeleton className="h-9 w-36" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
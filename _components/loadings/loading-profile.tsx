'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingProfile() {
    return (
        <div className="space-y-6">
            <div className="mb-8 my-1 space-y-0.5">
                <Skeleton className="w-44 h-7" />
                <Skeleton className="w-72 h-5" />
            </div>
            <div className="space-y-6">
                <div className="flex flex-col-reverse justify-between lg:flex-row gap-6">
                    <div className="min-w-2/3 flex flex-col flex-1 gap-6">
                        <div className="grid gap-2">
                            <Skeleton className="w-12 h-3.5" />
                            <Skeleton className="w-full h-9" />
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="w-24 h-3.5" />
                            <Skeleton className="w-full h-9" />
                            <Skeleton className="w-60 h-3.5" />
                            <Skeleton className="w-64 h-3.5" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Skeleton className="w-28 h-3.5 mx-auto" />
                        <div className="flex flex-col items-center gap-3">
                            <Skeleton className="relative size-40 rounded-full" />
                        </div>
                        <Skeleton className="w-28 h-8 mx-auto" />
                    </div>
                </div>
            </div>
            <Skeleton className="w-16 h-10" />
            <Skeleton className="w-[544px] h-[132px]" />
        </div>
    );
}
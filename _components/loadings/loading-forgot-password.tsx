'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingForgotPassword() {
    return (
        <div className="space-y-6 w-full 2xl:w-2/4">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <Skeleton className="w-52 h-7" />
                <Skeleton className="w-88 h-5" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-28 h-3.5" />
                <Skeleton className="w-88 h-9" />
            </div>
            <Skeleton className="w-88 h-9" />
            <Skeleton className="w-36 h-5 mx-auto" />
        </div>
    );
}
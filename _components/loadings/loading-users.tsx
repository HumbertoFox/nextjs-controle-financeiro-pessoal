'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingUsers() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min p-4">
                {[...Array(11)].map((_, index) => (
                    <Skeleton key={index} className="w-full h-10 mt-2" />
                ))}
            </div>
        </div>
    );
}
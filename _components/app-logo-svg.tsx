'use client';

import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'NextJs + Shadcn + Neon';

export default function AppLogoSvg() {
    return (
        <div className="flex items-center gap-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded-full dark:invert">
                <AppLogoIconSvg className="rounded-full" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{APP_NAME}</span>
            </div>
        </div>
    );
}
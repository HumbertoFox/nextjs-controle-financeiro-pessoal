import { type PropsWithChildren } from 'react';
import AuthSplitLayoutClient from './auth-split-layout-client';

export default function SettingsLayout({
    children,
}: PropsWithChildren) {
    return (
        <>
            <div className="flex">
                <AuthSplitLayoutClient />
                <section className="w-full flex justify-end items-center min-h-screen">
                    {children}
                </section>
            </div>
        </>
    );
}
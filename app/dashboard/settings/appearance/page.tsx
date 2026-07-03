import { Metadata } from 'next';
import AppearancePageClient from './appearance-client';
import { LoadingAppearance } from '@/_components/loadings/loading-appearance';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Aparência do sistema' };
}

export default function AppearancePage() {
    return (
        <Suspense fallback={<LoadingAppearance />}>
            <AppearancePageClient />
        </Suspense>
    );
}
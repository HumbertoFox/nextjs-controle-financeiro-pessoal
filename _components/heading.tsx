'use client';

import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { BreadcrumbItemProps, HeadingProps } from '@/_types';
import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, BreadcrumbItemProps[]> = {
    '/dashboard/settings': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações' }
    ],
    '/dashboard/settings/profile': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações', href: '/dashboard/settings' },
        { text: 'Perfil' }
    ],
    '/dashboard/settings/verify-email': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações', href: '/dashboard/settings' },
        { text: 'Verificar e-mail' }
    ],
    '/dashboard/settings/family': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações', href: '/dashboard/settings' },
        { text: 'Família' }
    ],
    '/dashboard/settings/password': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações', href: '/dashboard/settings' },
        { text: 'Senha' }
    ],
    '/dashboard/settings/appearance': [
        { text: 'Painel', href: '/dashboard' },
        { text: 'Configurações', href: '/dashboard/settings' },
        { text: 'Aparência' }
    ],
};

export default function Heading({ title, description }: HeadingProps) {
    const currentPath = usePathname();
    const breadcrumbItems = breadcrumbMap[currentPath] || [];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="mb-8 my-1 px-4 space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
        </>
    );
}
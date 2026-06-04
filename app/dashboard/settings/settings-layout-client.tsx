'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/_components/ui/button';
import Link from 'next/link';
import { cn } from '@/_lib/utils';
import { SidebarNavItemProps } from '@/_types';

const sidebarNavItems: SidebarNavItemProps[] = [
    { text: 'Configurações', href: '/dashboard/settings' },
    { text: 'Perfil', href: '/dashboard/settings/profile' },
    { text: 'Família', href: '/dashboard/settings/family' },
    { text: 'Senha', href: '/dashboard/settings/password' },
    { text: 'Aparência', href: '/dashboard/settings/appearance' }
];

export default function SettingsLayoutClient() {
    const currentPath = usePathname();
    return (
        <aside className="w-full max-w-xl lg:w-48">
            <nav className="flex flex-col space-y-1 space-x-0">
                {sidebarNavItems.map((item, index) => (
                    <Button
                        key={`${item.href}-${index}`}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn('w-full justify-start', {
                            'bg-muted': currentPath === item.href,
                        })}
                    >
                        <Link href={item.href} prefetch>
                            {item.text}
                        </Link>
                    </Button>
                ))}
            </nav>
        </aside>
    );
}
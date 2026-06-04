'use client';

import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/_components/ui/dropdown-menu';
import { UserInfo } from '@/_components/user-info';
import { useMobileNavigation } from '@/_hooks/use-mobile-navigation';
import { UserComponentProps } from '@/_types';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

export function UserMenuContent({ user }: UserComponentProps) {
    const cleanup = useMobileNavigation();
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-default">
                    <UserInfo
                        user={user}
                        showEmail={true}
                    />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/dashboard/settings"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Configurações
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href="/logout"
                    onClick={cleanup}
                >
                    <LogOut className="mr-2 rotate-180" />
                    Sair
                </Link>
            </DropdownMenuItem>
        </>
    );
}
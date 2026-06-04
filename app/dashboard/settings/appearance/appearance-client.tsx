'use client';

import { cn } from '@/_lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { HTMLAttributes, useEffect, useState } from 'react';

export default function AppearancePageClient({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);
    const tabs: {
        value: 'light' | 'dark' | 'system';
        icon: LucideIcon;
        label: string;
    }[] = [
            { value: 'light', icon: Sun, label: 'Claro' },
            { value: 'dark', icon: Moon, label: 'Escuro' },
            { value: 'system', icon: Monitor, label: 'Sistema' }
        ];
    if (!mounted) return null;
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Configurações de aparência</h2>
                    <p className="text-muted-foreground text-sm">Atualize as configurações de aparência da sua conta.</p>
                </div>
                <div
                    className={cn("inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800", className)}
                    {...props}
                >
                    {tabs.map(({ value, icon: Icon, label }) => (
                        <button
                            type="button"
                            key={value}
                            onClick={() => setTheme(value)}
                            className={cn(
                                "flex items-center rounded-md px-3.5 py-1.5 cursor-pointer transition-colors",
                                theme === value ? "bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100" : "text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60",
                            )}
                        >
                            <Icon className="-ml-1 h-4 w-4" />
                            <span className="ml-1.5 text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

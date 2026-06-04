import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { FileSliders, MonitorCog, UserRound } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Dashboard'
    };
}

const breadcrumbItems = [{ text: 'Dashboard' }];

const cards = [
    { href: "/dashboard/user", color: "border-blue-500", iconColor: "text-blue-500", icon: UserRound },
    { href: "/dashboard/settings/profile", color: "border-green-500", iconColor: "text-green-500", icon: FileSliders },
    { href: "/dashboard/settings/appearance", color: "border-purple-500", iconColor: "text-purple-500", icon: MonitorCog }
];

export default function DashboardPage() {
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col-reverse lg:flex-col gap-4 p-2">
                <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min border border-emerald-500" />
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={index}
                                href={card.href}
                                className={`flex items-center justify-center bg-muted/50 aspect-video rounded-xl border ${card.color} hover:border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-linear-to-br hover:from-muted hover:to-muted/60`}
                            >
                                <Icon className={`size-16 ${card.iconColor}`} />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
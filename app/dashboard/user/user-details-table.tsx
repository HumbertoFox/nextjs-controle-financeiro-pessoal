import { useInitials } from '@/_hooks/use-initials';
import { formatDate } from '@/_lib/useful';
import { UserDetailsTableProps } from '@/_types';

export function UserDetailsTable({ user, familyName }: UserDetailsTableProps) {
    const getInitials = useInitials();
    const isVerified = !!user.email_verified;
    const memberSince = user.created_at
        ? formatDate(user.created_at)
        : '—';

    return (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span className="text-sm font-medium">Detalhes do usuário</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Usuário</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Família</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Membro desde</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                                            {getInitials(user.name)}
                                        </div>
                                    )}
                                    <span className="font-medium text-foreground">{user.name}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3">
                                <span className="inline-block text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-amber-400'}`} />
                                    <span className="text-muted-foreground text-xs">
                                        {isVerified ? 'Verificado' : 'Não verificado'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-3">
                                {familyName ? (
                                    <div className="flex items-center gap-2">
                                        <span>{familyName}</span>
                                        {user.is_owner && (
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">owner</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground text-xs">{memberSince}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
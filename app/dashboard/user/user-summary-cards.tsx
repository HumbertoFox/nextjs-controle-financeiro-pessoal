import { accountTypeLabel, roleLabels, UserSummaryCardsProps } from '@/_types';

export function UserSummaryCards({ user, accounts }: UserSummaryCardsProps) {
    const accountTypes = accounts
        .map((a) => accountTypeLabel[a.type] ?? a.type)
        .join(' · ') || 'Nenhuma conta';

    return (
        <div className="grid gap-3 md:grid-cols-3">
            {/* Card: Família */}
            <div className="bg-background rounded-xl border border-border p-4 border-l-[3px] border-l-teal-600">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Família</p>
                <p className="text-2xl font-medium text-foreground">
                    {user.family_name ?? '—'}
                </p>
                <div className="mt-1">
                    {user.is_owner ? (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                            proprietário
                        </span>
                    ) : user.family_id ? (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            membro
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">sem família</span>
                    )}
                </div>
            </div>

            {/* Card: Role */}
            <div className="bg-background rounded-xl border border-border p-4 border-l-[3px] border-l-violet-600">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Perfil de acesso</p>
                <p className="text-2xl font-medium text-foreground">
                    {roleLabels[user.role] ?? user.role}
                </p>
                <div className="mt-1">
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {user.role}
                    </span>
                </div>
            </div>

            {/* Card: Contas */}
            <div className="bg-background rounded-xl border border-border p-4 border-l-[3px] border-l-amber-500">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contas ativas</p>
                <p className="text-2xl font-medium text-foreground">{accounts.length}</p>
                <p className="mt-1 text-xs text-muted-foreground truncate">{accountTypes}</p>
            </div>
        </div>
    );
}
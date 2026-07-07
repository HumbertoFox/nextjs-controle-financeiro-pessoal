import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card';
import { AccountsSummaryProps, accountTypeLabel } from '@/_types';
import { Wallet, CreditCard, Landmark } from 'lucide-react';

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
    const totalGeneral = accounts.reduce((acc, curr) => acc + parseFloat(curr.current_balance || '0'), 0);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CHECKING': return <Landmark className="size-4 text-blue-500" />;
            case 'CREDIT_CARD': return <CreditCard className="size-4 text-purple-500" />;
            default: return <Wallet className="size-4 text-emerald-500" />;
        }
    };
    return (
        <div className="flex flex-col gap-4">
            <Card className="bg-muted/40">
                <CardContent className="pt-2">
                    <p className="text-sm font-medium text-muted-foreground">Patrimônio Total das Contas</p>
                    <h3 className="text-3xl font-bold tracking-tight">
                        R$ {totalGeneral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => {
                    const balance = parseFloat(account.current_balance || '0');
                    return (
                        <Card key={account.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-sm font-semibold truncate max-w-[80%]">
                                    {account.name}
                                </CardTitle>
                                {getIcon(account.type)}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-1">
                                    {accountTypeLabel[account.type] || 'Outros'}
                                </p>
                                <div className={`text-lg font-bold ${balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { DialogAddAccount } from '@/_components/dialog-add-account';
import { DialogAddCategory } from '@/_components/dialog-add-category';
import { DialogAddTransaction } from '@/_components/dialog-add-transaction';
import { TransactionsTable } from '@/_components/transactions-table';
import { accountRepository } from '@/_lib/accountrepository';
import { categoryRepository } from '@/_lib/categoryrepository';
import { getUser } from '@/_lib/dal';
import { transactionRepository } from '@/_lib/transactionrepository';
import { UserPublic, UserRolesZod } from '@/_types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Transações' };
};

const breadcrumbItems = [
    { text: 'Painel', href: '/dashboard' },
    { text: 'Transações' }
];

const PAGE_SIZE = 20;

export default async function TransactionsPage() {
    const userActive = await getUser() as UserPublic;
    if (!userActive || !UserRolesZod.includes(userActive.role)) redirect('/logout');

    const [{ rows, total }, accounts, categories] = await Promise.all([
        transactionRepository.findByUserIdPaginated(userActive.id, 1, PAGE_SIZE),
        accountRepository.findByUserId(userActive.id),
        categoryRepository.findTreeByUserId(userActive.id)
    ]);
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-2">
                {/* Barra de ações */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {total} {total === 1 ? 'transação' : 'transações'}
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <DialogAddAccount />

                        <DialogAddCategory
                            categories={categories}
                        />

                        <DialogAddTransaction
                            accounts={accounts}
                            categories={categories}
                        />
                    </div>
                </div>

                {/* Tabela */}
                <TransactionsTable
                    rows={rows}
                    total={total}
                    pageSize={PAGE_SIZE}
                />
            </div>
        </>
    );
}
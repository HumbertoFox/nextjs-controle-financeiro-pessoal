import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { accountRepository } from '@/_lib/accountrepository';
import { transactionRepository } from '@/_lib/transactionrepository';
import { Metadata } from 'next';
import { AccountsSummary } from './accounts-summary';
import { ExpensesCategoryCard } from './expenses-category-card';
import { UserPublic, UserRolesZod } from '@/_types';
import { getUser } from '@/_lib/dal';
import { redirect } from 'next/navigation';
import { userRepository } from '@/_lib/userrepositorys';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Painel' };
}

const breadcrumbItems = [{ text: 'Painel' }];

export default async function DashboardPage() {
    const userActive = await getUser() as UserPublic;
    if (!userActive || !UserRolesZod.includes(userActive.role)) redirect('/logout');

    const userId = userActive.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Buscamos em paralelo o perfil completo do banco e os dados que dependem estritamente APENAS do userId
    const [dbUser, accounts, categoryExpenses] = await Promise.all([
        userRepository.findActiveById(userId),
        accountRepository.getDashboardBalances(userId),
        transactionRepository.getDashboardExpensesByCategory(userId, currentMonth, currentYear)
    ]);

    const familyId = dbUser?.family_id;

    // 2. Buscamos os gastos da família caso o ID exista (evitando query desnecessária)
    const familyExpenses = familyId
        ? await transactionRepository.getFamilyDashboardExpensesByCategory(familyId, currentMonth, currentYear)
        : [];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-col gap-8 p-2 max-w-7xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel</h1>
                    <p className="text-muted-foreground">Veja a visão consolidada de suas finanças.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 items-start">
                    {/* Lado Esquerdo/Centro: Listagem e Saldos das Contas (Ocupa 2 colunas) */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">Suas Contas</h2>
                        <AccountsSummary accounts={accounts} />
                    </div>

                    {/* Lado Direito: Ranking Macro de Gastos do mês atual (Ocupa 1 coluna) */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-foreground tracking-tight">Seus Gastos</h2>
                            <ExpensesCategoryCard expenses={categoryExpenses} />
                        </div>

                        {/* Exibe o card da família apenas se o usuário possuir um vínculo familiar ativo */}
                        {familyId && (
                            <div className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold text-foreground tracking-tight">Gastos da Família</h2>
                                <ExpensesCategoryCard expenses={familyExpenses} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
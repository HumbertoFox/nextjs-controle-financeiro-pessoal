import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/_components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getCsrfToken } from '@/_lib/csrf';
import getVisiblePagination from '@/_lib/getvisiblepagination';
import { userRepository } from '@/_lib/userrepositorys';
import { Metadata } from 'next';
import { UserActionButtons } from '@/_components/user-action-buttons';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Users' };
}

const breadcrumbItems = [
    { text: 'Dashboard', href: '/dashboard' },
    { text: 'Admins', href: '/dashboard/admins' },
    { text: 'Users' }
];

const pageSize = 10;

export default async function UsersPage(props: { searchParams?: Promise<{ page?: number; }>; }) {
    const params = await props.searchParams;
    const rawPage = parseInt(String(params?.page ?? '1'), 10);
    const currentPage = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
    const [users, total] = await userRepository.findUsersPaginated(currentPage, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    const csrfToken = await getCsrfToken();
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-2">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Table className="w-full text-center text-xs">
                        <TableHeader>
                            <TableRow className="cursor-default">
                                <TableHead className="text-center">No.</TableHead>
                                <TableHead className="text-center max-lg:hidden">Code.</TableHead>
                                <TableHead className="text-center max-lg:hidden">Name</TableHead>
                                <TableHead className="text-center">E-mail</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 && (
                                <TableRow className="text-red-600 cursor-default">
                                    <TableCell colSpan={5}>There are no registered users.</TableCell>
                                </TableRow>
                            )}
                            {users.map((user, index) => (
                                <TableRow key={user.id} className="cursor-default">
                                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                                    <TableCell className="max-lg:hidden">{user.id}</TableCell>
                                    <TableCell className="max-lg:hidden">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="flex justify-evenly items-center my-1">
                                        <UserActionButtons
                                            user={user}
                                            csrfToken={csrfToken}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <Pagination className="pb-2.5">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                                    aria-disabled={currentPage <= 1}
                                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {getVisiblePagination(currentPage, totalPages).map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === '...' ? (
                                        <PaginationLink
                                            href="#"
                                            aria-disabled
                                            className="pointer-events-none opacity-50"
                                        >
                                            ...
                                        </PaginationLink>
                                    ) : (
                                        <PaginationLink
                                            href={`?page=${page}`}
                                            isActive={currentPage === page}
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                                    aria-disabled={currentPage >= totalPages}
                                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </>
    );
}
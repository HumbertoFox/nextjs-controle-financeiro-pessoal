'use client';

import { formatCurrency, formatDate } from '@/_lib/useful';
import { TransactionsTableProps, TransactionStatusClass, transactionStatusLabel } from '@/_types';

export function TransactionsTable({ rows, total, pageSize }: TransactionsTableProps) {
    if (!rows.length) {
        return (
            <div className="bg-background rounded-xl border border-border flex items-center justify-center min-h-50">
                <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
        );
    }
    return (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm cursor-default">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Conta</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Subcategoria</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                    {formatDate(row.transaction_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{row.account_name}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span>{row.category_name}</span>
                                        {/* Badge indicador de parcela */}
                                        {row.installments_total && row.installment_number && (
                                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                                                {row.installment_number}/{row.installments_total}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {row.subcategory_name
                                        ? (row.subsubcategory_name
                                            ? `${row.subcategory_name} / ${row.subsubcategory_name}`
                                            : row.subcategory_name)
                                        : '—'}
                                </td>
                                <td
                                    className="px-4 py-3 text-muted-foreground text-xs max-w-45 truncate"
                                    title={row.description ?? undefined}
                                >
                                    {row.description
                                        ? (row.description.length > 10
                                            ? `${row.description.slice(0, 10)}...`
                                            : row.description)
                                        : '—'}
                                </td>
                                <td className={`px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap ${row.type === 'REVENUE' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {row.type === 'EXPENSE' ? '−' : '+'}{formatCurrency(parseFloat(row.value))}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded ${TransactionStatusClass[row.status]}`}>
                                        {transactionStatusLabel[row.status]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {total > pageSize && (
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                    Exibindo {rows.length} de {total} transações
                </div>
            )}
        </div>
    );
}
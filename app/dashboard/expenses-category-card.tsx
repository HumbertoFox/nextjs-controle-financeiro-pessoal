import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card';
import { Progress } from '@/_components/ui/progress';
import { ExpensesCategoryCardProps } from '@/_types';

export function ExpensesCategoryCard({ expenses }: ExpensesCategoryCardProps) {
    const totalValue = expenses.reduce((acc, curr) => acc + curr.total_value, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>Visão consolidada no nível macro (sem subcategorias)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                        Nenhum gasto registrado neste mês.
                    </p>
                ) : (
                    expenses.map((item) => {
                        const percentage = totalValue > 0 ? (item.total_value / totalValue) * 100 : 0;
                        return (
                            <div key={item.category_name} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium truncate max-w-[65%]">
                                        {item.category_name}
                                    </span>
                                    <span className="font-semibold text-muted-foreground shrink-0">
                                        R$ {item.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        <span className="text-xs font-normal ml-1 text-muted-foreground/70">
                                            ({percentage.toFixed(0)}%)
                                        </span>
                                    </span>
                                </div>
                                <Progress value={percentage} className="h-2 bg-secondary" />
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
import type { NamedCategoryShare } from '@/application/reports/get-overview';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { formatPercent } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';

/** Onde vai o dinheiro: as maiores categorias de despesa dos últimos 12 meses. */
export function CategoryBars({ categories }: { categories: readonly NamedCategoryShare[] }) {
  return (
    <Card title="Para onde vai o dinheiro" icon="chart-bar" subtitle="Despesa liquidada, 12 meses">
      {categories.length === 0 ? (
        <EmptyState icon="receipt" title="Sem despesas liquidadas">
          Ainda não há despesas pagas nos últimos 12 meses.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li key={c.categoryId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-fg truncate font-medium">{c.name}</span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <MoneyText value={c.total} />
                  <span className="text-fg-muted w-10 text-right text-xs">
                    {formatPercent(c.share)}
                  </span>
                </span>
              </div>
              <div className="bg-surface-strong mt-1 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-chart-expense h-full rounded-full"
                  style={{ width: `${c.share * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

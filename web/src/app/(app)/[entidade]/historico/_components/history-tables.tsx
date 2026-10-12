import type { History } from '@/application/reports/get-history';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { formatPeriod } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { Table, Td, Th } from '@/ui/table';

export function MonthlyTable({ history }: { readonly history: History }) {
  return (
    <Card title="Mês a mês" icon="table" subtitle="Só lançamentos liquidados">
      <Table stickyFirst>
        <thead>
          <tr>
            <Th>Mês</Th>
            <Th className="text-right">Receitas</Th>
            <Th className="text-right">Despesas</Th>
            <Th className="text-right">Resultado</Th>
            <Th className="text-right">Acumulado</Th>
          </tr>
        </thead>
        <tbody>
          {history.months.map((m) => (
            <tr key={m.period}>
              <Td className="text-fg font-medium whitespace-nowrap">{formatPeriod(m.period)}</Td>
              <Td className="text-right">
                <MoneyText value={m.income} />
              </Td>
              <Td className="text-right">
                <MoneyText value={m.expense} />
              </Td>
              <Td className="text-right">
                <MoneyText value={m.result} signed />
              </Td>
              <Td className="text-right font-medium">
                <MoneyText value={m.cumulative} signed />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

interface CategoryTableProps {
  readonly history: History;
  readonly names: ReadonlyMap<string, string>;
}

export function CategoryTable({ history, names }: CategoryTableProps) {
  return (
    <Card title="Por categoria" icon="tags" subtitle="Do maior para o menor movimento">
      {history.categories.length === 0 ? (
        <EmptyState icon="tags" title="Sem movimentos liquidados neste ano" />
      ) : (
        <Table stickyFirst>
          <thead>
            <tr>
              <Th>Categoria</Th>
              <Th className="text-right">Receitas</Th>
              <Th className="text-right">Despesas</Th>
              <Th className="text-right">Líquido</Th>
            </tr>
          </thead>
          <tbody>
            {history.categories.map((c) => (
              <tr key={c.categoryId}>
                <Td className="text-fg font-medium">{names.get(c.categoryId)}</Td>
                <Td className="text-right">
                  <MoneyText value={c.income} />
                </Td>
                <Td className="text-right">
                  <MoneyText value={c.expense} />
                </Td>
                <Td className="text-right font-medium">
                  <MoneyText value={c.net} signed />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

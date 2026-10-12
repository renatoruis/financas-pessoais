import type { CurrencyKpis } from '@/domain/reports/overview';
import { subtract } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { formatMoney } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { Stat } from '@/ui/stat';

function Variation({ kpis }: { kpis: CurrencyKpis }) {
  const delta = subtract(kpis.result, kpis.previousResult);
  if (delta.cents === 0) return <Badge>igual ao mês anterior</Badge>;
  const up = delta.cents > 0;
  return (
    <Badge tone={up ? 'success' : 'danger'} icon={up ? 'arrow-trend-up' : 'arrow-trend-down'}>
      {`${formatMoney(delta, { signed: true })} vs mês anterior`}
    </Badge>
  );
}

/** Os números do mês, somando as entidades da mesma moeda. */
export function KpiStrip({ kpis }: { kpis: CurrencyKpis }) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Stat size="lg" label="Resultado do mês" value={<MoneyText value={kpis.result} signed />} />
        <Variation kpis={kpis} />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Stat label="Entrou" value={<MoneyText value={kpis.income} />} />
        <Stat label="Saiu" value={<MoneyText value={kpis.expense} />} />
        <Stat label="Fecho previsto" value={<MoneyText value={kpis.balance} signed />} />
        <Stat label="A receber" value={<MoneyText value={kpis.receivable} />} />
        <Stat label="A pagar" value={<MoneyText value={kpis.payable} />} />
      </div>
    </Card>
  );
}

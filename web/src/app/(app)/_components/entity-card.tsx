import type { ReactNode } from 'react';
import type { EntityCard as EntityCardData } from '@/application/reports/get-dashboard';
import { isZero } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { ButtonLink } from '@/ui/button';
import { Card } from '@/ui/card';
import { Icon } from '@/ui/icon';
import { MoneyText } from '@/ui/money-text';
import { Stat } from '@/ui/stat';
import { ValueList, ValueRow } from '@/ui/value-list';
import { GROUP_ICON } from '../_lib/labels';

const MAX_MISSING_SHOWN = 3;

interface EntityCardProps {
  readonly card: EntityCardData;
  /** Para onde leva a seta do cartão. */
  readonly href: string;
  /** Indicador extra da entidade (ex.: IVA a guardar, caixa dos imóveis). */
  readonly extra?: ReactNode;
}

/** Linha destacada para o `extra` do cartão. */
export function CardNote({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-slate-600">
        <Icon name={icon} className="text-slate-400" />
        {label}
      </span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function missingLabel(missing: readonly string[]): string {
  const shown = missing.slice(0, MAX_MISSING_SHOWN).join(', ');
  const rest = missing.length - MAX_MISSING_SHOWN;
  return rest > 0 ? `${shown} +${rest}` : shown;
}

function Alerts({ card }: { readonly card: EntityCardData }) {
  const { summary, missing } = card;
  const calm = summary.overdueCount === 0 && summary.dueSoonCount === 0 && missing.length === 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      {summary.overdueCount > 0 && (
        <Badge
          tone="danger"
          icon="triangle-exclamation"
        >{`${summary.overdueCount} em atraso`}</Badge>
      )}
      {summary.dueSoonCount > 0 && (
        <Badge tone="warning" icon="clock">{`${summary.dueSoonCount} vencem em 7 dias`}</Badge>
      )}
      {missing.length > 0 && (
        <Badge tone="info" icon="list-check">{`Falta lançar: ${missingLabel(missing)}`}</Badge>
      )}
      {calm && (
        <Badge tone="success" icon="circle-check">
          Mês em dia
        </Badge>
      )}
    </div>
  );
}

export function EntityCard({ card, href, extra }: EntityCardProps) {
  const { entity, summary } = card;
  return (
    <Card
      title={entity.name}
      subtitle={entity.currency}
      icon={GROUP_ICON[entity.group]}
      accent={entity.color}
      actions={<ButtonLink size="sm" variant="ghost" icon="arrow-right" href={href} />}
    >
      <div className="space-y-5">
        <Stat
          size="lg"
          label="Fecho previsto do mês"
          value={<MoneyText value={summary.balance} signed />}
          hint={
            summary.expectedCount > 0 && !isZero(summary.deviation) ? (
              <>
                Desvio vs previsto: <MoneyText value={summary.deviation} signed />
              </>
            ) : undefined
          }
        />
        <ValueList>
          <ValueRow label="Recebido">
            <MoneyText value={summary.income} />
          </ValueRow>
          <ValueRow label="Pago">
            <MoneyText value={summary.expense} />
          </ValueRow>
          <ValueRow label="A receber">
            <MoneyText value={summary.receivable} />
          </ValueRow>
          <ValueRow label="A pagar">
            <MoneyText value={summary.payable} />
          </ValueRow>
        </ValueList>
        {extra}
        <Alerts card={card} />
      </div>
    </Card>
  );
}

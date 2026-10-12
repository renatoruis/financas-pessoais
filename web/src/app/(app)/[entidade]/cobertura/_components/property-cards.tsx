import type { CoverageSummary } from '@/domain/properties/coverage';
import type { PropertyCash } from '@/domain/properties/property-cash';
import type { ApartmentSummary } from '@/domain/properties/property-overview';
import { isPositive } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { MoneyText } from '@/ui/money-text';
import { Stat } from '@/ui/stat';
import { Table, Td, Th } from '@/ui/table';
import { ValueList, ValueRow } from '@/ui/value-list';

type Names = ReadonlyMap<string, string>;

export function ApartmentCard({ apartment, names }: { apartment: ApartmentSummary; names: Names }) {
  return (
    <Card title={names.get(apartment.costCenterId)} icon="house">
      <Stat size="lg" label="Saldo do mês" value={<MoneyText value={apartment.balance} signed />} />
      <ValueList className="mt-4">
        <ValueRow label="Aluguel recebido">
          <MoneyText value={apartment.income} />
        </ValueRow>
        <ValueRow label="Pago">
          <MoneyText value={apartment.expense} />
        </ValueRow>
        <ValueRow label="A pagar">
          <MoneyText value={apartment.payable} />
        </ValueRow>
      </ValueList>
    </Card>
  );
}

interface CoverageCardProps {
  readonly coverage: CoverageSummary;
  readonly names: Names;
  /** Centros a mostrar na tabela (sem linhas vazias). */
  readonly visible: ReadonlySet<string>;
}

export function CoverageCard({ coverage, names, visible }: CoverageCardProps) {
  return (
    <Card
      title="Cobertura entre apartamentos"
      subtitle="Quem sobra cobre quem falta; o resto vem da caixa"
      icon="scale-balanced"
    >
      <Table stickyFirst>
        <thead>
          <tr>
            <Th>Apartamento</Th>
            <Th className="text-right">Resultado</Th>
            <Th className="text-right">Cobriu outros</Th>
            <Th className="text-right">Coberto por outros</Th>
            <Th className="text-right">Pela caixa</Th>
          </tr>
        </thead>
        <tbody>
          {coverage.centers
            .filter((c) => visible.has(c.costCenterId))
            .map((c) => (
              <tr key={c.costCenterId}>
                <Td className="text-fg font-medium">{names.get(c.costCenterId)}</Td>
                <Td className="text-right">
                  <MoneyText value={c.result} signed />
                </Td>
                <Td className="text-right">
                  <MoneyText value={c.coveredOthers} />
                </Td>
                <Td className="text-right">
                  <MoneyText value={c.coveredByOthers} />
                </Td>
                <Td className="text-right">
                  <MoneyText value={c.coveredByCash} />
                </Td>
              </tr>
            ))}
        </tbody>
      </Table>
      <ValueList className="mt-4">
        <ValueRow label="Sobra total">
          <MoneyText value={coverage.surplus} />
        </ValueRow>
        <ValueRow label="Falta total">
          <MoneyText value={coverage.deficit} />
        </ValueRow>
        <ValueRow label="Coberto entre apartamentos">
          <MoneyText value={coverage.coveredBetween} />
        </ValueRow>
        <ValueRow label="Resultado do mês" strong>
          <MoneyText value={coverage.monthResult} signed />
        </ValueRow>
      </ValueList>
    </Card>
  );
}

export function CashCard({ cash }: { cash: PropertyCash }) {
  return (
    <Card
      title="Caixa dos imóveis"
      icon="piggy-bank"
      actions={
        isPositive(cash.contributionNeeded) && (
          <Badge tone="danger" icon="triangle-exclamation">
            Precisa de aporte
          </Badge>
        )
      }
    >
      <Stat size="lg" label="Fim do mês" value={<MoneyText value={cash.end} signed />} />
      <ValueList className="mt-4">
        <ValueRow label="Início do mês">
          <MoneyText value={cash.start} />
        </ValueRow>
        <ValueRow label="Resultado do mês">
          <MoneyText value={cash.monthResult} signed />
        </ValueRow>
        <ValueRow label="Aportes">
          <MoneyText value={cash.contributions} />
        </ValueRow>
        <ValueRow label="Retiradas">
          <MoneyText value={cash.withdrawals} />
        </ValueRow>
        <ValueRow label="Coberto pela caixa">
          <MoneyText value={cash.coveredByCash} />
        </ValueRow>
        <ValueRow label="Aporte necessário" strong>
          <MoneyText value={cash.contributionNeeded} />
        </ValueRow>
      </ValueList>
    </Card>
  );
}

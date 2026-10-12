import type { Entry } from '../entries/entry';
import { signedCents } from '../entries/entry-lifecycle';
import { SYSTEM_CATEGORIES } from '../reference/reference-data';
import type { Currency } from '../shared/currency';
import { add, money, subtract, type Money } from '../shared/money';
import { vatQuarterOf } from './vat-calendar';

export interface VatBalance {
  /** IVA de faturas já recebidas. */
  readonly collected: Money;
  /** IVA já entregue ao Estado. */
  readonly paid: Money;
  /** Dinheiro em caixa que pertence ao Estado. */
  readonly toSetAside: Money;
  /** IVA de faturas ainda por receber. */
  readonly pendingInvoiceVat: Money;
  readonly companyCash: Money;
  /** Caixa da empresa − IVA a guardar. */
  readonly available: Money;
}

export interface VatQuarter {
  readonly quarter: string;
  readonly invoiced: Money;
  readonly delivered: Money;
  readonly outstanding: Money;
}

const isVat = (e: Entry): boolean => e.categoryId === SYSTEM_CATEGORIES.vat;

const totalCents = (entries: readonly Entry[]): number =>
  entries.reduce((acc, e) => acc + (e.amount?.cents ?? 0), 0);

/** `entries`: todos os lançamentos da empresa com IVA (todos os meses). */
export function computeVatBalance(entries: readonly Entry[], initialCash: Money): VatBalance {
  const c = initialCash.currency;
  const vat = entries.filter(isVat);
  const collected = money(
    totalCents(vat.filter((e) => e.kind === 'income' && e.status === 'settled')),
    c,
  );
  const paid = money(
    totalCents(vat.filter((e) => e.kind === 'expense' && e.status === 'settled')),
    c,
  );
  const pendingInvoiceVat = money(
    totalCents(vat.filter((e) => e.kind === 'income' && e.status === 'pending')),
    c,
  );
  const settledNet = entries
    .filter((e) => e.status === 'settled')
    .reduce((acc, e) => acc + signedCents(e), 0);
  const toSetAside = subtract(collected, paid);
  const companyCash = add(initialCash, money(settledNet, c));
  return {
    collected,
    paid,
    toSetAside,
    pendingInvoiceVat,
    companyCash,
    available: subtract(companyCash, toSetAside),
  };
}

/** IVA faturado (não cancelado) vs entregue (liquidado) por trimestre. */
export function vatByQuarter(entries: readonly Entry[], currency: Currency): VatQuarter[] {
  const rows = new Map<string, { invoiced: number; delivered: number }>();
  for (const e of entries.filter((x) => isVat(x) && x.status !== 'cancelled')) {
    const row = rows.get(vatQuarterOf(e)) ?? { invoiced: 0, delivered: 0 };
    if (e.kind === 'income') row.invoiced += e.amount?.cents ?? 0;
    else if (e.status === 'settled') row.delivered += e.amount?.cents ?? 0;
    rows.set(vatQuarterOf(e), row);
  }
  return [...rows.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, r]) => ({
      quarter,
      invoiced: money(r.invoiced, currency),
      delivered: money(r.delivered, currency),
      outstanding: money(r.invoiced - r.delivered, currency),
    }));
}

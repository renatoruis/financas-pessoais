import { describe, expect, it } from 'vitest';
import { SettleEntry } from '../entries/settle-entry';
import { makeDeps } from '../testing/in-memory';
import { GetVatOverview } from './get-vat-overview';
import { RegisterInvoice } from './register-invoice';

describe('casos de uso do IVA', () => {
  it('fatura, liquidação com valor final e IVA a guardar', async () => {
    const deps = makeDeps();
    await new RegisterInvoice(deps).execute({ invoiceDate: '2026-10-31', days: 20 });

    let overview = await new GetVatOverview(deps).execute();
    expect(overview.openInvoices).toHaveLength(1);
    expect(overview.balance.pendingInvoiceVat.cents).toBe(119600);
    expect(overview.nextDeadline).toBe('2026-11-25');

    const base = overview.openInvoices[0]!;
    expect(base.description).toBe('Fatura reach-it 2026-10');
    await new SettleEntry(deps).execute({ id: base.id, finalAmountCents: 546000 });

    overview = await new GetVatOverview(deps).execute();
    expect(overview.openInvoices).toHaveLength(0);
    expect(overview.balance.toSetAside.cents).toBe(125580);
    expect(overview.balance.companyCash.cents).toBe(546000 + 125580);
    expect(overview.quarters[0]).toMatchObject({ quarter: '2026-T4' });
  });

  it('recusa centro que não é da Empresa PT', async () => {
    const deps = makeDeps();
    await expect(
      new RegisterInvoice(deps).execute({
        invoiceDate: '2026-10-31',
        days: 1,
        costCenterId: 'rossi',
      }),
    ).rejects.toThrow('nesta entidade');
  });
});

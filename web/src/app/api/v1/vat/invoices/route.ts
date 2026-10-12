import { getContainer } from '@/composition/container';
import { command, readJson } from '../../_lib/respond';
import { invoiceBody } from '../../_lib/schemas';

/** Regista a fatura da Empresa PT (base + IVA ligados, pendentes). */
export const POST = command(async (request) =>
  getContainer().registerInvoice.execute(invoiceBody.parse(await readJson(request))),
);

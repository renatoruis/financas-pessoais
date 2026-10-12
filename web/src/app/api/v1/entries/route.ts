import { getContainer } from '@/composition/container';
import { parseEntryFilters, toEntryFilter } from '../../../(app)/[entidade]/lancamentos/filters';
import { resolvePeriod } from '../../../(app)/_lib/period';
import { command, query, readJson, searchParamsOf } from '../_lib/respond';
import { createEntryBody } from '../_lib/schemas';

/** `?mes=AAAA-MM&entidade=&centro=&estado=&q=` (sem `entidade` = todas). */
export const GET = query((request) => {
  const c = getContainer();
  const params = searchParamsOf(request);
  const period = resolvePeriod(params, c.clock.today());
  return c.listEntries.execute(toEntryFilter(parseEntryFilters(params), period, params.entidade));
});

export const POST = command(async (request) =>
  getContainer().createEntry.execute(createEntryBody.parse(await readJson(request))),
);

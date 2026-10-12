import { getContainer } from '@/composition/container';
import { query, searchParamsOf } from '../_lib/respond';
import { entityQuery } from '../_lib/schemas';

/** `?entidade=` (obrigatório): modelos dessa entidade. */
export const GET = query((request) =>
  getContainer().listRecurring.execute(entityQuery.parse(searchParamsOf(request).entidade)),
);

import { getContainer } from '@/composition/container';
import { query, searchParamsOf } from '../_lib/respond';
import { historyQuery } from '../_lib/schemas';

/** `?entidade=pessoal-pt&ano=2026` */
export const GET = query((request) => {
  const { entidade, ano } = historyQuery.parse(searchParamsOf(request));
  return getContainer().getHistory.execute({ entityId: entidade, year: ano });
});

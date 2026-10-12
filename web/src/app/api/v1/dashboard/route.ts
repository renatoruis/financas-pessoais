import { getContainer } from '@/composition/container';
import { resolvePeriod } from '../../../(app)/_lib/period';
import { query, searchParamsOf } from '../_lib/respond';

export const GET = query((request) => {
  const c = getContainer();
  return c.getDashboard.execute(resolvePeriod(searchParamsOf(request), c.clock.today()));
});

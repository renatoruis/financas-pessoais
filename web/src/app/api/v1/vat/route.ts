import { getContainer } from '@/composition/container';
import { query } from '../_lib/respond';

export const GET = query(() => getContainer().getVatOverview.execute());

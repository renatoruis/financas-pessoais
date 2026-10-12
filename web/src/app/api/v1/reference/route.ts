import { getContainer } from '@/composition/container';
import { query, searchParamsOf } from '../_lib/respond';

/** `?entidade=` (opcional): só os centros e categorias dessa entidade. */
export const GET = query((request) =>
  getContainer().getReferenceData.execute(searchParamsOf(request).entidade),
);

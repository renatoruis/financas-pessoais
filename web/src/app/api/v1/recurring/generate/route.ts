import { getContainer } from '@/composition/container';
import { command, readJson } from '../../_lib/respond';
import { generateBody } from '../../_lib/schemas';

/** `{ entityId, period: "AAAA-MM" }` → cria os pendentes em falta da entidade e devolve `{ created }`. */
export const POST = command(async (request) =>
  getContainer().generateRecurring.execute(generateBody.parse(await readJson(request))),
);

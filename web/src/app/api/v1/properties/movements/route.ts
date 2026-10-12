import { getContainer } from '@/composition/container';
import { command, readJson } from '../../_lib/respond';
import { movementBody } from '../../_lib/schemas';

/** Aporte ou retirada na caixa dos Imóveis (só o lado dos Imóveis). */
export const POST = command(async (request) =>
  getContainer().registerPropertyMovement.execute(movementBody.parse(await readJson(request))),
);

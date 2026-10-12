import { getContainer } from '@/composition/container';
import { command, readJson, type IdContext } from '../../../_lib/respond';
import { settleEntryBody } from '../../../_lib/schemas';

/** Corpo opcional: `{ finalAmountCents, on }`. Liquida também os lançamentos ligados. */
export const POST = command(async (request, { params }: IdContext) => {
  const { id } = await params;
  return getContainer().settleEntry.execute({
    ...settleEntryBody.parse(await readJson(request)),
    id,
  });
});

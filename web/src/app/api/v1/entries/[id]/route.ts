import { getContainer } from '@/composition/container';
import { command, readJson, type IdContext } from '../../_lib/respond';
import { updateEntryBody } from '../../_lib/schemas';

export const PATCH = command(async (request, { params }: IdContext) => {
  const { id } = await params;
  return getContainer().updateEntry.execute({
    ...updateEntryBody.parse(await readJson(request)),
    id,
  });
});

export const DELETE = command(async (_request, { params }: IdContext) =>
  getContainer().deleteEntry.execute((await params).id),
);

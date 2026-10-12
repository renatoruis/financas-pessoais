import { getContainer } from '@/composition/container';
import { command, type IdContext } from '../../../_lib/respond';

export const POST = command(async (_request, { params }: IdContext) =>
  getContainer().reopenEntry.execute((await params).id),
);

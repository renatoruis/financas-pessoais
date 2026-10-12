import type { ReactNode } from 'react';
import { Icon } from '@/ui/icon';
import { EntityModuleTabs } from '../_components/entity-module-tabs';
import { loadEntityRoute, type EntityParams } from '../_lib/entity-route';
import { GROUP_ICON } from '../_lib/labels';

interface LayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<EntityParams>;
}

export default async function EntityLayout({ children, params }: LayoutProps) {
  const { entity } = await loadEntityRoute(params);
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: entity.color }}
        >
          <Icon name={GROUP_ICON[entity.group]} />
          {entity.name}
          <span className="font-normal text-slate-400">{entity.currency}</span>
        </p>
        <EntityModuleTabs entityId={entity.id} />
      </div>
      {children}
    </div>
  );
}

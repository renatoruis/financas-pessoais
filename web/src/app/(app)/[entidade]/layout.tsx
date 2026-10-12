import type { CSSProperties, ReactNode } from 'react';
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
          className="text-accent flex items-center gap-2 text-sm font-semibold"
          style={{ '--accent': entity.color } as CSSProperties}
        >
          <Icon name={GROUP_ICON[entity.group]} />
          {entity.name}
          <span className="text-fg-subtle font-normal">{entity.currency}</span>
        </p>
        <EntityModuleTabs entityId={entity.id} />
      </div>
      {children}
    </div>
  );
}

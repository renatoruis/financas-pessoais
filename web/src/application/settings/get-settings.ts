import type { Settings } from '@/domain/settings/settings';
import type { SettingsRepository } from '../ports/settings-repository';

interface Deps {
  readonly settings: SettingsRepository;
}

export class GetSettings {
  constructor(private readonly deps: Deps) {}

  execute(): Promise<Settings> {
    return this.deps.settings.get();
  }
}

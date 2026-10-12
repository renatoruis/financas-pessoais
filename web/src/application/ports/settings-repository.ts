import type { Settings } from '@/domain/settings/settings';

export interface SettingsRepository {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<void>;
}

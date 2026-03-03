import { Injectable, Logger } from '@nestjs/common';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  permissions: { action: string; subject: string }[];
  menuEntries?: { label: string; path: string; icon?: string; roles?: string[] }[];
  hooks?: string[];
}

@Injectable()
export class PluginRegistryService {
  private readonly logger = new Logger(PluginRegistryService.name);
  private plugins: Map<string, PluginManifest> = new Map();

  registerPlugin(manifest: PluginManifest) {
    this.plugins.set(manifest.id, manifest);
    this.logger.log(`Plugin enregistré: ${manifest.name} v${manifest.version}`);
  }

  getPlugin(id: string): PluginManifest | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getMenuEntries(userRoles: string[]) {
    return this.getAllPlugins()
      .flatMap((p) => p.menuEntries || [])
      .filter((entry) => !entry.roles || entry.roles.some((r) => userRoles.includes(r)));
  }

  getPermissions(): { action: string; subject: string }[] {
    return this.getAllPlugins().flatMap((p) => p.permissions);
  }
}

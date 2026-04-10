import { Provider } from '@nestjs/common';

export const MEILI_CLIENT = 'MEILI_CLIENT';

/**
 * Meilisearch client factory provider — singleton instance.
 * Uses dynamic import() because the meilisearch package is ESM-only.
 * Reads MEILI_HOST and MEILI_API_KEY from environment variables.
 */
// Preserve dynamic import — prevents tsc from converting to require()
const importDynamic = new Function('modulePath', 'return import(modulePath)');

export const MeiliProvider: Provider = {
  provide: MEILI_CLIENT,
  useFactory: async () => {
    const host = process.env.MEILI_HOST;
    if (!host) {
      console.warn('⚠️ MEILI_HOST not set — Meilisearch disabled');
      return null;
    }
    const apiKey = process.env.MEILI_API_KEY || 'carone_meili_master_key_2024';
    const { Meilisearch } = await importDynamic('meilisearch');
    const client = new Meilisearch({ host, apiKey });
    console.log(`✅ Meilisearch client initialized → ${host}`);
    return client;
  },
};

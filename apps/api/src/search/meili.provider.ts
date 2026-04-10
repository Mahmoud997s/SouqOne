import { Provider } from '@nestjs/common';

export const MEILI_CLIENT = 'MEILI_CLIENT';

/**
 * Meilisearch client factory provider — singleton instance.
 * Uses dynamic import() because the meilisearch package is ESM-only.
 * Reads MEILI_HOST and MEILI_API_KEY from environment variables.
 */
export const MeiliProvider: Provider = {
  provide: MEILI_CLIENT,
  useFactory: async () => {
    // @ts-ignore — meilisearch is ESM-only; dynamic import works at runtime
    const { Meilisearch } = await import('meilisearch');
    const host = process.env.MEILI_HOST || 'http://localhost:7700';
    const apiKey = process.env.MEILI_API_KEY || 'carone_meili_master_key_2024';

    const client = new Meilisearch({ host, apiKey });
    console.log(`✅ Meilisearch client initialized → ${host}`);
    return client;
  },
};

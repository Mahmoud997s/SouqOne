import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    console.log(`[RedisIoAdapter] REDIS_URL present: ${!!redisUrl}, starts with: ${redisUrl?.substring(0, 20)}...`);

    try {
      const pubClient = redisUrl
        ? createClient({ url: redisUrl })
        : createClient({
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
            },
            password: process.env.REDIS_PASSWORD || undefined,
          });

      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('✅ Redis Socket.IO Adapter connected');
    } catch (err) {
      console.warn('⚠️ Redis Socket.IO Adapter failed — using default adapter:', (err as Error).message);
      this.adapterConstructor = null;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

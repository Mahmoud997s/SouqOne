import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private publisher!: Redis;
  private subscriber!: Redis;
  private connected = false;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    console.log(`[RedisService] REDIS_URL present: ${!!redisUrl}, starts with: ${redisUrl?.substring(0, 20)}...`);

    const retryStrategy = (times: number) => {
      if (times > 5) return null as any;
      return Math.min(times * 200, 2000);
    };

    const opts: any = { retryStrategy, maxRetriesPerRequest: 3, lazyConnect: true };

    if (redisUrl) {
      this.client = new Redis(redisUrl, opts);
      this.publisher = new Redis(redisUrl, opts);
      this.subscriber = new Redis(redisUrl, opts);
    } else {
      const config = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        ...opts,
      };
      this.client = new Redis(config);
      this.publisher = new Redis(config);
      this.subscriber = new Redis(config);
    }

    this.client.on('error', (err) => console.error('Redis Client Error:', err.message));
    this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err.message));
    this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err.message));

    try {
      await this.client.connect();
      await this.publisher.connect();
      await this.subscriber.connect();
      this.connected = true;
      console.log('✅ Redis connected');
    } catch (err) {
      this.connected = false;
      console.warn('⚠️ Redis connection failed — caching disabled:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    await this.client.quit().catch(() => {});
    await this.publisher.quit().catch(() => {});
    await this.subscriber.quit().catch(() => {});
  }

  getClient(): Redis {
    return this.client;
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  // Cache operations
  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.connected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch {}
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return;
    try { await this.client.del(key); } catch {}
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {}
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch { return false; }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.connected) return;
    try { await this.client.expire(key, seconds); } catch {}
  }

  // Atomic increment — useful for rate limiting
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.connected) return 0;
    try {
      const val = await this.client.incr(key);
      // Set TTL only on first increment (when val === 1)
      if (ttlSeconds && val === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return val;
    } catch { return 0; }
  }

  // Set a key only if it does not exist (with TTL) — useful for cooldowns
  async setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!this.connected) return false;
    try {
      const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch { return false; }
  }

  // Get remaining TTL of a key in seconds
  async getTTL(key: string): Promise<number> {
    if (!this.connected) return -2;
    try {
      return await this.client.ttl(key);
    } catch { return -2; }
  }

  isReady(): boolean {
    return this.connected && !!this.subscriber && this.subscriber.status === 'ready';
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    if (!this.connected) return;
    try { await this.publisher.publish(channel, JSON.stringify(message)); } catch {}
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.connected || !this.subscriber) {
      console.warn('Redis subscriber not ready, skipping subscribe for:', channel);
      return;
    }
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            callback(JSON.parse(msg));
          } catch (err) {
            console.error('Error parsing Redis message:', err);
          }
        }
      });
    } catch {}
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.connected) return;
    try { await this.subscriber.unsubscribe(channel); } catch {}
  }
}

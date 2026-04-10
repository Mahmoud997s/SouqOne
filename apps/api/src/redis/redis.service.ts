import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private publisher!: Redis;
  private subscriber!: Redis;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    console.log(`[RedisService] REDIS_URL present: ${!!redisUrl}, starts with: ${redisUrl?.substring(0, 20)}...`);

    const retryStrategy = (times: number) => {
      if (times > 5) return null as any; // stop retrying after 5 attempts
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
      console.log('✅ Redis connected');
    } catch (err) {
      console.warn('⚠️ Redis connection failed — caching disabled:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.publisher.quit();
    await this.subscriber.quit();
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
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  isReady(): boolean {
    return !!this.subscriber && this.subscriber.status === 'ready';
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.subscriber) {
      console.warn('Redis subscriber not ready, skipping subscribe for:', channel);
      return;
    }
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
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }
}

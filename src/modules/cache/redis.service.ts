import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor() {
        const host = process.env.REDIS_HOST || '127.0.0.1';
        const port = Number(process.env.REDIS_PORT) || 6379;
        const password = process.env.REDIS_PASSWORD || undefined;

        this.client = new Redis({ host, port, password });
    }

    async get<T = any>(key: string): Promise<T | null> {
        const raw = await this.client.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return raw as unknown as T;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number) {
        const raw = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
            await this.client.set(key, raw, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, raw);
        }
    }

    async del(key: string) {
        await this.client.del(key);
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}

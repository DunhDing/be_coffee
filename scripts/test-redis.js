require('dotenv').config();
const Redis = require('ioredis');

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
const password = process.env.REDIS_PASSWORD || undefined;

console.log(`Attempting Redis connection to ${host}:${port} (masked password)`);

const client = new Redis({ host, port, password });

(async () => {
    try {
        await client.set('test:redis', 'ok', 'EX', 10);
        const v = await client.get('test:redis');
        console.log('SET/GET result:', v);
        await client.del('test:redis');
        console.log('DEL completed');
        await client.quit();
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message || e);
        try { await client.quit(); } catch { }
        process.exit(2);
    }
})();

// src/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Khởi tạo một Connection Pool từ thư viện 'pg' sử dụng URL từ .env
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });

    // 2. Tạo một Prisma Adapter bọc quanh pool đó
    const adapter = new PrismaPg(pool);

    // 3. Truyền adapter vào hàm super() của PrismaClient
    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    // Kết nối runtime
    await this.$connect();
  }

  async onModuleDestroy() {
    // Đóng kết nối an toàn khi ứng dụng NestJS tắt
    await this.$disconnect();
    await this.pool.end();
  }
}
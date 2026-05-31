import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repo/product.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';

@Module({
	controllers: [ProductController],
	providers: [ProductService, ProductRepository, PrismaService, RedisService],
	exports: [ProductService],
})
export class ProductModule { }

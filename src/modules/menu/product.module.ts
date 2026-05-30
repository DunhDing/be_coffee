import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repo/product.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
	controllers: [ProductController],
	providers: [ProductService, ProductRepository, PrismaService],
	exports: [ProductService],
})
export class ProductModule {}

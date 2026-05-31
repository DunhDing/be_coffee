import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repo/product.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';
import { BranchMenuController } from './controllers/branch-menu.controller';
import { BranchMenuService } from './services/branch-menu.service';
import { BranchMenuRepository } from './repo/branch-menu.repository';
import { MenuController } from './controllers/menu.controller';

@Module({
	controllers: [ProductController, BranchMenuController, MenuController],
	providers: [ProductService, ProductRepository, BranchMenuService, BranchMenuRepository, PrismaService, RedisService],
	exports: [ProductService, BranchMenuService],
})
export class MenuModule { }


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleRepository {
	constructor(private readonly prisma: PrismaService) { }

	create(roleName: string) {
		return this.prisma.role.create({
			data: {
				role_name: roleName,
			},
		});
	}

	findAll() {
		return this.prisma.role.findMany({
			orderBy: {
				role_name: 'asc',
			},
		});
	}

	findById(id: string) {
		return this.prisma.role.findUnique({
			where: { role_id: id },
		});
	}

	findByName(roleName: string) {
		return this.prisma.role.findUnique({
			where: { role_name: roleName },
		});
	}

	update(id: string, roleName: string) {
		return this.prisma.role.update({
			where: { role_id: id },
			data: {
				role_name: roleName,
			},
		});
	}

	delete(id: string) {
		return this.prisma.role.delete({
			where: { role_id: id },
		});
	}
}

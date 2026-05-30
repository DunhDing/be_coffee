import {
	ConflictException,
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCodes } from '../../common/constants/error-codes';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
	constructor(private readonly roleRepository: RoleRepository) { }

	async create(dto: CreateRoleDto) {
		const existingRole = await this.roleRepository.findByName(dto.roleName);

		if (existingRole) {
			throw new ConflictException({
				code: ErrorCodes.ROLE_NAME_ALREADY_EXISTS,
				message: 'Role name already exists',
			});
		}

		const role = await this.roleRepository.create(dto.roleName);

		return {
			message: 'Role created successfully',
			data: role,
		};
	}

	findAll() {
		return this.roleRepository.findAll();
	}

	async findOne(id: string) {
		const role = await this.roleRepository.findById(id);

		if (!role) {
			throw new NotFoundException({
				code: ErrorCodes.ROLE_NOT_FOUND,
				message: 'Role not found',
			});
		}

		return role;
	}

	async update(id: string, dto: UpdateRoleDto) {
		await this.findOne(id);

		if (!dto.roleName) {
			throw new BadRequestException({
				code: ErrorCodes.ROLE_NAME_REQUIRED,
				message: 'roleName is required',
			});
		}

		const existingRole = await this.roleRepository.findByName(dto.roleName);

		if (existingRole && existingRole.role_id !== id) {
			throw new ConflictException({
				code: ErrorCodes.ROLE_NAME_ALREADY_EXISTS,
				message: 'Role name already exists',
			});
		}

		try {
			const role = await this.roleRepository.update(id, dto.roleName);

			return {
				message: 'Role updated successfully',
				data: role,
			};
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException({
					code: ErrorCodes.ROLE_NOT_FOUND,
					message: 'Role not found',
				});
			}

			throw error;
		}
	}

	async remove(id: string) {
		await this.findOne(id);

		try {
			const role = await this.roleRepository.delete(id);

			return {
				message: 'Role deleted successfully',
				data: role,
			};
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException({
					code: ErrorCodes.ROLE_NOT_FOUND,
					message: 'Role not found',
				});
			}

			throw error;
		}
	}
}

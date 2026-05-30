import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post()
	@ApiOperation({ summary: 'Create a role' })
	@ApiBody({ type: CreateRoleDto })
	@ApiCreatedResponse({ description: 'Role created' })
	@ApiConflictResponse({ description: 'Role name already exists' })
	@ApiBadRequestResponse({ description: 'Invalid request body' })
	create(@Body() dto: CreateRoleDto) {
		return this.roleService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all roles' })
	@ApiOkResponse({ description: 'Role list returned' })
	findAll() {
		return this.roleService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a role by id' })
	@ApiParam({ name: 'id', type: String, example: 'c8b0a8d6-8fb0-4c2c-9dbe-9d8e1d7e4b77' })
	@ApiOkResponse({ description: 'Role returned' })
	@ApiNotFoundResponse({ description: 'Role not found' })
	findOne(@Param('id') id: string) {
		return this.roleService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a role' })
	@ApiParam({ name: 'id', type: String, example: 'c8b0a8d6-8fb0-4c2c-9dbe-9d8e1d7e4b77' })
	@ApiBody({ type: UpdateRoleDto })
	@ApiOkResponse({ description: 'Role updated' })
	@ApiConflictResponse({ description: 'Role name already exists' })
	@ApiNotFoundResponse({ description: 'Role not found' })
	@ApiBadRequestResponse({ description: 'Invalid request body' })
	update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
		return this.roleService.update(id, dto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a role' })
	@ApiParam({ name: 'id', type: String, example: 'c8b0a8d6-8fb0-4c2c-9dbe-9d8e1d7e4b77' })
	@ApiOkResponse({ description: 'Role deleted' })
	@ApiNotFoundResponse({ description: 'Role not found' })
	remove(@Param('id') id: string) {
		return this.roleService.remove(id);
	}
}

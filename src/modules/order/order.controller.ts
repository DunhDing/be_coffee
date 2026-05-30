import { Body, Controller, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @ApiOperation({ summary: 'Customer places a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ description: 'Order created' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Admin - get all orders (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'Order list returned' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.findAll({ page, limit, branchId, status });
  }

  @Get('my')
  @ApiOperation({ summary: 'Customer - get their own orders (requires customerId query)' })
  @ApiQuery({ name: 'customerId', required: true, type: String })
  @ApiOkResponse({ description: 'Customer orders returned' })
  findMyOrders(@Query('customerId') customerId: string) {
    return this.orderService.findMyOrders(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Order returned' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin - update order status' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ description: 'Order status updated' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateStatus(id, dto);
  }
}

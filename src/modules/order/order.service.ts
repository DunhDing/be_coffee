import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepository } from './order.repository';
import { LoyaltyService } from '../loyalty/services/loyalty.service';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly loyaltyService: LoyaltyService,
    private readonly redis: RedisService
  ) {}

  /**
   * Map raw Prisma order to frontend-friendly shape
   */
  private toResponse(order: any) {
    return {
      id: order.order_id,
      branchId: order.branch_id ?? '',
      branchName: order.branch?.branch_name ?? '',
      customerName: order.customer?.full_name ?? '',
      customerPhone: order.customer?.phone_number ?? '',
      customerId: order.customer_id ?? null,
      deliveryAddress: order.delivery_address ?? '',
      pointsEarned: order.points_earned ?? 0,
      pointsUsed: order.points_used ?? 0,
      status: order.status,
      paymentMethod: order.payment_method?.method_name ?? 'Cash',
      items: (order.order_details ?? []).map((d: any) => ({
        productId: d.product_id,
        productName: d.product?.product_name ?? '',
        quantity: d.quantity,
        price: Number(d.unit_price),
      })),
      total: Number(order.total_amount),
      createdAt: order.order_date?.toISOString() ?? new Date().toISOString(),
    };
  }

  /**
   * POST /orders — customer places order
   */
  async create(dto: CreateOrderDto) {
    try {
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Order must have at least one item');
      }

      // Resolve payment method
      const paymentId = await this.orderRepository.findOrCreatePaymentMethod(
        dto.paymentMethod ?? 'Cash',
      );

      const items = dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        subAmount: item.price * item.quantity,
      }));

      const rawTotalAmount = items.reduce((sum, item) => sum + item.subAmount, 0);
      const usePoints = dto.pointsUsed ? dto.pointsUsed > 0 : false;

      const { earnedPoints, pointsUsed, finalTotal } = await this.loyaltyService.calculatePointsPreview(
        dto.customerId,
        rawTotalAmount,
        usePoints
      );

      const order = await this.orderRepository.create({
        branchId: dto.branchId ?? undefined,
        customerId: dto.customerId ?? undefined,
        paymentId,
        totalAmount: finalTotal,
        status: 'Pending',
        deliveryAddress: dto.deliveryAddress,
        pointsEarned: earnedPoints,
        pointsUsed: pointsUsed,
        items,
      });

      if (pointsUsed > 0) {
        try {
          await this.loyaltyService.deductPointsForNewOrder(order.order_id);
        } catch (err) {
          // ignore
        }
      }

      return {
        message: 'Order created successfully',
        data: this.toResponse(order),
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to create order');
    }
  }

  /**
   * GET /orders — admin list all orders
   */
  async findAll(query: { page?: number; limit?: number; branchId?: string; status?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderRepository.findAll({
        skip,
        take: limit,
        branchId: query.branchId,
        status: query.status,
      }),
      this.orderRepository.count({
        branchId: query.branchId,
        status: query.status,
      }),
    ]);

    return {
      message: 'Orders retrieved successfully',
      data: orders.map((o) => this.toResponse(o)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /orders/my — customer get their own orders (by customerId from JWT)
   */
  async findMyOrders(customerId: string) {
    const cacheKey = `orders:customer:${customerId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached as any;

    const orders = await this.orderRepository.findByCustomerId(customerId);
    const result = {
      message: 'Orders retrieved successfully',
      data: orders.map((o) => this.toResponse(o)),
    };

    await this.redis.set(cacheKey, result, 30); // Cache for 30 seconds
    return result;
  }

  /**
   * GET /orders/:id
   */
  async findOne(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return {
      message: 'Order retrieved successfully',
      data: this.toResponse(order),
    };
  }

  /**
   * PATCH /orders/:id/status — admin update order status
   */
  async updateStatus(id: string, dto: UpdateOrderDto) {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const newStatus = dto.status ?? existing.status ?? 'Pending';
    const updated = await this.orderRepository.updateStatus(id, newStatus);
    
    if (newStatus === 'Completed' && existing.status !== 'Completed') {
      try {
        await this.loyaltyService.syncPointsFromPaidOrder(id);
      } catch (err) {
        // ignore errors so it doesn't rollback the order status
      }
    }

    return {
      message: 'Order status updated successfully',
      data: this.toResponse(updated),
    };
  }
}

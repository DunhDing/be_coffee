import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { CreateLoyaltyConfigDto } from '../dtos/create-loyalty-config.dto';
import { EarnPointDto } from '../dtos/earn-point.dto';
import { RedeemPointDto } from '../dtos/redeem-point.dto';
import { UpdateLoyaltyConfigDto } from '../dtos/update-loyalty-config.dto';
import { LoyaltyRepository } from '../repo/loyalty.repository';

type LoyaltyRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

type RankDistribution = {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
};

@Injectable()
export class LoyaltyService {
    constructor(private readonly loyaltyRepository: LoyaltyRepository) { }

    async getConfigs() {
        const configs = await this.loyaltyRepository.findConfigs();

        return {
            message: 'Loyalty configs found successfully',
            data: configs,
        };
    }

    async getConfigById(configId: string) {
        const config = await this.loyaltyRepository.findConfigById(configId);
        if (!config) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Loyalty config with ID "${configId}" not found`,
            });
        }

        return {
            message: 'Loyalty config found successfully',
            data: config,
        };
    }

    async createConfig(dto: CreateLoyaltyConfigDto) {
        const config = await this.loyaltyRepository.createConfig(dto);

        return {
            message: 'Loyalty config created successfully',
            data: config,
        };
    }

    async updateConfig(configId: string, dto: UpdateLoyaltyConfigDto) {
        const existingConfig = await this.loyaltyRepository.findConfigById(configId);
        if (!existingConfig) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Loyalty config with ID "${configId}" not found`,
            });
        }

        if (Object.values(dto).every((value) => value === undefined)) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'At least one field is required to update loyalty config',
            });
        }

        const config = await this.loyaltyRepository.updateConfig(configId, dto);

        return {
            message: 'Loyalty config updated successfully',
            data: config,
        };
    }

    async deleteConfig(configId: string) {
        const existingConfig = await this.loyaltyRepository.findConfigById(configId);
        if (!existingConfig) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Loyalty config with ID "${configId}" not found`,
            });
        }

        await this.loyaltyRepository.deleteConfig(configId);

        return {
            message: 'Loyalty config deleted successfully',
            data: { config_id: configId },
        };
    }

    async earnPoints(dto: EarnPointDto) {
        const [customer, order, config] = await Promise.all([
            this.loyaltyRepository.findCustomerById(dto.customerId),
            this.loyaltyRepository.findOrderById(dto.orderId),
            this.loyaltyRepository.findCurrentConfig(),
        ]);

        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer with ID "${dto.customerId}" not found`,
            });
        }

        if (!order) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Order with ID "${dto.orderId}" not found`,
            });
        }

        if (order.customer_id && order.customer_id !== dto.customerId) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Order does not belong to this customer',
            });
        }

        if (!config) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'No loyalty config found',
            });
        }

        const totalAmountNumber = Number(order.total_amount);
        const earnRateAmount = Number(config.earn_rate_amount);
        const earnRatePoint = Number(config.earn_rate_point);
        const earnedPoints = Math.floor(
            (totalAmountNumber / earnRateAmount) * earnRatePoint,
        );

        if (earnedPoints <= 0) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Order amount is not enough to earn points',
            });
        }

        const updatedCustomer = await this.loyaltyRepository.updateCustomerPoints(
            dto.customerId,
            earnedPoints,
        );
        const history = await this.loyaltyRepository.createPointHistory({
            customer_id: dto.customerId,
            order_id: dto.orderId,
            point_change: earnedPoints,
        });

        return {
            message: 'Points earned successfully',
            data: {
                earnedPoints,
                currentPoints: updatedCustomer.total_points ?? 0,
                history,
            },
        };
    }

    async syncPointsFromPaidOrder(orderId: string) {
        const order = await this.loyaltyRepository.findOrderById(orderId);

        if (!order) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Order with ID "${orderId}" not found`,
            });
        }

        if (!order.customer_id) {
            return {
                skipped: true,
                earnedPoints: 0,
                currentPoints: 0,
                reason: 'ORDER_HAS_NO_CUSTOMER',
            };
        }

        const [customer, config, existingEarnHistory] = await Promise.all([
            this.loyaltyRepository.findCustomerById(order.customer_id),
            this.loyaltyRepository.findCurrentConfig(),
            this.loyaltyRepository.findPointHistoryByCustomerAndOrder(order.customer_id, orderId, 'earn'),
        ]);

        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer with ID "${order.customer_id}" not found`,
            });
        }

        if (!config) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'No loyalty config found',
            });
        }

        if (existingEarnHistory) {
            return {
                skipped: true,
                earnedPoints: 0,
                currentPoints: customer.total_points ?? 0,
                reason: 'POINTS_ALREADY_SYNCED',
            };
        }

        const earnedPoints = order.points_earned ?? 0;

        if (earnedPoints <= 0) {
            return {
                skipped: true,
                earnedPoints: 0,
                currentPoints: customer.total_points ?? 0,
                reason: 'NO_POINTS_CHANGE',
            };
        }

        const updatedCustomer = await this.loyaltyRepository.updateCustomerPoints(
            customer.customer_id,
            earnedPoints,
        );

        const history = await this.loyaltyRepository.createPointHistory({
            customer_id: customer.customer_id,
            order_id: orderId,
            point_change: earnedPoints,
        });

        return {
            skipped: false,
            earnedPoints,
            currentPoints: updatedCustomer.total_points ?? 0,
            history,
            reason: null,
        };
    }

    async deductPointsForNewOrder(orderId: string) {
        const order = await this.loyaltyRepository.findOrderById(orderId);
        if (!order || !order.customer_id) return;
        
        const usedPoints = order.points_used ?? 0;
        if (usedPoints <= 0) return;

        const customer = await this.loyaltyRepository.findCustomerById(order.customer_id);
        if (!customer) return;

        const existingRedeemHistory = await this.loyaltyRepository.findPointHistoryByCustomerAndOrder(order.customer_id, orderId, 'redeem');
        if (existingRedeemHistory) return;

        await this.loyaltyRepository.updateCustomerPoints(customer.customer_id, -usedPoints);
        await this.loyaltyRepository.createPointHistory({
            customer_id: customer.customer_id,
            order_id: orderId,
            point_change: -usedPoints,
        });
    }

    async redeemPoints(dto: RedeemPointDto) {
        const [customer, order] = await Promise.all([
            this.loyaltyRepository.findCustomerById(dto.customerId),
            this.loyaltyRepository.findOrderById(dto.orderId),
        ]);

        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer with ID "${dto.customerId}" not found`,
            });
        }

        if (!order) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Order with ID "${dto.orderId}" not found`,
            });
        }

        if (order.customer_id && order.customer_id !== dto.customerId) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Order does not belong to this customer',
            });
        }

        const currentPoints = customer.total_points ?? 0;
        if (currentPoints < dto.points) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: `Insufficient points. Current: ${currentPoints}, required: ${dto.points}`,
            });
        }

        const updatedCustomer = await this.loyaltyRepository.updateCustomerPoints(
            dto.customerId,
            -dto.points,
        );
        const history = await this.loyaltyRepository.createPointHistory({
            customer_id: dto.customerId,
            order_id: dto.orderId,
            point_change: -dto.points,
        });

        return {
            message: 'Points redeemed successfully',
            data: {
                redeemedPoints: dto.points,
                currentPoints: updatedCustomer.total_points ?? 0,
                history,
            },
        };
    }

    async getCustomerProfile(customerId: string) {
        const customer = await this.loyaltyRepository.findCustomerById(customerId);
        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer with ID "${customerId}" not found`,
            });
        }

        const orders = await this.loyaltyRepository.getCustomerOrders(customerId);
        const completedOrders = orders.filter((o) => o.status === 'Completed');
        const totalSpent = completedOrders.reduce(
            (sum, order) => sum + Number(order.total_amount),
            0,
        );
        const currentPoints = customer.total_points ?? 0;

        return {
            message: 'Customer loyalty profile found successfully',
            data: {
                customer,
                currentPoints,
                rank: this.calculateRank(totalSpent),
                totalOrders: completedOrders.length,
                totalSpent,
            },
        };
    }

    async getCustomerHistory(customerId: string) {
        const customer = await this.loyaltyRepository.findCustomerById(customerId);
        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer with ID "${customerId}" not found`,
            });
        }

        const history = await this.loyaltyRepository.getCustomerHistory(customerId);

        return {
            message: 'Customer loyalty history found successfully',
            data: history,
        };
    }

    calculateRank(totalSpent: number): LoyaltyRank {
        if (totalSpent >= 5000000) return 'DIAMOND';
        if (totalSpent >= 3000000) return 'GOLD';
        if (totalSpent >= 1000000) return 'SILVER';

        return 'BRONZE';
    }

    getMultiplier(rank: LoyaltyRank): number {
        if (rank === 'DIAMOND') return 2;
        if (rank === 'GOLD') return 1.5;
        if (rank === 'SILVER') return 1.2;
        return 1;
    }

    async calculatePointsPreview(customerId: string | undefined, totalAmount: number, usePoints: boolean) {
        let earnedPoints = 0;
        let pointsUsed = 0;
        let finalTotal = totalAmount;

        if (!customerId) {
            return { earnedPoints, pointsUsed, finalTotal };
        }

        const customer = await this.loyaltyRepository.findCustomerById(customerId);
        if (!customer) {
            return { earnedPoints, pointsUsed, finalTotal };
        }

        const currentPoints = customer.total_points ?? 0;
        const orders = await this.loyaltyRepository.getCustomerOrders(customerId);
        const completedOrders = orders.filter((o) => o.status === 'Completed');
        const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        const rank = this.calculateRank(totalSpent);
        const multiplier = this.getMultiplier(rank);

        // Usage
        const pointsToVnd = 1000;
        if (usePoints && currentPoints > 0) {
            const maxUsablePoints = Math.min(currentPoints, Math.floor(totalAmount / pointsToVnd));
            pointsUsed = maxUsablePoints;
            const discount = pointsUsed * pointsToVnd;
            finalTotal = Math.max(0, totalAmount - discount);
        }

        // Earn
        const config = await this.loyaltyRepository.findCurrentConfig();
        if (config) {
            const earnRateAmount = Number(config.earn_rate_amount);
            const earnRatePoint = Number(config.earn_rate_point);
            const basePoints = (finalTotal / earnRateAmount) * earnRatePoint;
            earnedPoints = Math.floor(basePoints * multiplier);
        } else {
            const basePoints = finalTotal / 10000;
            earnedPoints = Math.floor(basePoints * multiplier);
        }

        return { earnedPoints, pointsUsed, finalTotal, multiplier };
    }

    async getTierDistribution() {
        const distribution = await this.calculateTierDistribution();

        return {
            message: 'Tier distribution found successfully',
            data: distribution,
        };
    }

    async getRetentionRate() {
        const retention = await this.calculateRetentionRate();

        return {
            message: 'Retention rate found successfully',
            data: retention,
        };
    }

    async getTopCustomers() {
        const customers = await this.loyaltyRepository.getTopCustomers();

        return {
            message: 'Top loyalty customers found successfully',
            data: customers.map((customer) => ({
                customerId: customer.customer_id,
                fullName: customer.full_name,
                totalPoints: customer.total_points ?? 0,
            })),
        };
    }

    async getDashboard() {
        const [customers, distribution, retention, issued, redeemed] = await Promise.all([
            this.loyaltyRepository.getAllCustomers(),
            this.calculateTierDistribution(),
            this.calculateRetentionRate(),
            this.loyaltyRepository.getTotalPointsIssued(),
            this.loyaltyRepository.getTotalPointsRedeemed(),
        ]);

        return {
            message: 'Loyalty dashboard found successfully',
            data: {
                totalCustomers: customers.length,
                totalPointsIssued: issued._sum.point_change ?? 0,
                totalPointsRedeemed: Math.abs(redeemed._sum.point_change ?? 0),
                bronzeCount: distribution.bronze,
                silverCount: distribution.silver,
                goldCount: distribution.gold,
                diamondCount: distribution.diamond,
                retentionRate: retention.retentionRate,
            },
        };
    }

    private async calculateTierDistribution(): Promise<RankDistribution> {
        const customers = await this.loyaltyRepository.getAllCustomers();
        const customerOrders = await Promise.all(
            customers.map((customer) =>
                this.loyaltyRepository.getCustomerOrders(customer.customer_id),
            ),
        );

        return customers.reduce<RankDistribution>(
            (distribution, customer, index) => {
                const orders = customerOrders[index];
                const completedOrders = orders.filter((o) => o.status === 'Completed');
                const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
                const rank = this.calculateRank(totalSpent);

                if (rank === 'DIAMOND') distribution.diamond += 1;
                if (rank === 'GOLD') distribution.gold += 1;
                if (rank === 'SILVER') distribution.silver += 1;
                if (rank === 'BRONZE') distribution.bronze += 1;

                return distribution;
            },
            {
                bronze: 0,
                silver: 0,
                gold: 0,
                diamond: 0,
            },
        );
    }

    private async calculateRetentionRate() {
        const customers = await this.loyaltyRepository.getAllCustomers();
        const customerOrders = await Promise.all(
            customers.map((customer) =>
                this.loyaltyRepository.getCustomerOrders(customer.customer_id),
            ),
        );

        const customersWithMultipleOrders = customerOrders.filter(
            (orders) => orders.length >= 2,
        ).length;
        const retentionRate =
            customers.length > 0
                ? Number(((customersWithMultipleOrders / customers.length) * 100).toFixed(2))
                : 0;

        return {
            totalCustomers: customers.length,
            customersWithMultipleOrders,
            retentionRate,
        };
    }
}

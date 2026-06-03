import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const SHIPPING_PRICE = 10;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  findAll() {
    return this.prisma.order.findMany({
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(dto: CreateOrderDto) {
    if (!dto.orderItems.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const aggregatedItems = new Map<string, number>();
    dto.orderItems.forEach((item) => {
      const currentQuantity = aggregatedItems.get(item.productId) || 0;
      aggregatedItems.set(item.productId, currentQuantity + item.quantity);
    });

    const productIds = [...aggregatedItems.keys()];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products in the order were not found');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItemData = productIds.map((productId) => {
      const product = productMap.get(productId);
      const quantity = aggregatedItems.get(productId) || 0;

      if (!product) {
        throw new BadRequestException('One or more products in the order were not found');
      }

      if (!product.isAvailable) {
        throw new BadRequestException(`${product.name} is currently unavailable`);
      }

      if (product.stockQuantity < quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }

      const unitPrice = product.discountPrice ?? product.price;

      return {
        productId,
        quantity,
        price: unitPrice,
      };
    });

    const subtotalAmount = orderItemData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalAmount = subtotalAmount + SHIPPING_PRICE;

    const order = await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        orderItemData.map(async (item) => {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              isAvailable: true,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
              isAvailable: true,
            },
          });

          if (result.count === 0) {
            const product = productMap.get(item.productId);
            throw new BadRequestException(`Not enough stock for ${product?.name || item.productId}`);
          }

          // Update isAvailable if stock is now 0
          const updatedProduct = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (updatedProduct && updatedProduct.stockQuantity === 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { isAvailable: false },
            });
          }

          return result;
        }),
      );

      const createdOrder = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          deliveryAddress: dto.deliveryAddress,
          totalAmount,
          orderItems: {
            create: orderItemData,
          },
        },
        include: { orderItems: { include: { product: true } } },
      });

      return createdOrder;
    });

    await this.notifyAdmin(order);

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: { include: { product: true } } },
    });

    await this.notifyAdmin(updated, true);

    return updated;
  }

  private async notifyAdmin(order: any, isUpdate = false) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_ADMIN_CHAT');
    if (!token || !chatId) {
      return;
    }

    const action = isUpdate ? 'Order updated' : 'New order';
    const icon = isUpdate ? '[updated]' : '[new]';
    
    const itemsText = order.orderItems
      .map((item: any) => `- ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = [
      `${action} ${icon}`,
      `Order ID: ${order.id}`,
      `Customer: ${order.customerName}`,
      `Email: ${order.customerEmail}`,
      `Phone: ${order.customerPhone}`,
      `Address: ${order.deliveryAddress}`,
      `Shipping: $${SHIPPING_PRICE.toFixed(2)}`,
      `Total: $${Number(order.totalAmount).toFixed(2)}`,
      `Status: ${order.status}`,
      '',
      'Items:',
      itemsText,
    ].join('\n');

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`Telegram notification failed: ${response.status} ${errorBody}`);
      }
    } catch (error) {
      // Notification failures should not block the request.
      console.warn(
        `Telegram notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

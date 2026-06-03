import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isAvailable: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    const data: Prisma.ProductUncheckedCreateInput = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: dto.price,
      discountPrice: dto.discountPrice,
      stockQuantity: dto.stockQuantity,
      sku: dto.sku,
      brand: dto.brand,
      categoryId: dto.categoryId,
      specifications: dto.specifications as Prisma.InputJsonValue | undefined,
      images: dto.images ?? [],
      isFeatured: dto.isFeatured ?? false,
      isAvailable: dto.isAvailable ?? true,
    };

    return this.prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.discountPrice !== undefined) data.discountPrice = dto.discountPrice;
    if (dto.stockQuantity !== undefined) data.stockQuantity = dto.stockQuantity;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.brand !== undefined) data.brand = dto.brand;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.specifications !== undefined) {
      data.specifications = dto.specifications as Prisma.InputJsonValue;
    }
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isAvailable !== undefined) data.isAvailable = dto.isAvailable;

    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}

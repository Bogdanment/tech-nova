import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { products: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { products: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
      include: { products: true },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data,
      include: { products: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}

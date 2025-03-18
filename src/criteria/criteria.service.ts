import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCriteriaDto, UpdateCriteriaDto } from './dto/criteria.dto';

@Injectable()
export class CriteriaService {
    constructor(private prisma: PrismaService) { }

    async createCriteria(dto: CreateCriteriaDto) {
        const existingCriteria = await this.prisma.criteria.findFirst({
            where: { text: dto.text },
        });

        if (existingCriteria) {
            throw new ConflictException('Criteria with this text already exists');
        }

        return this.prisma.criteria.create({ data: { ...dto } });
    }

    async getAllCriteria() {
        const criteria = await this.prisma.criteria.findMany();
        if (!criteria || criteria.length === 0) {
            throw new NotFoundException('No criteria found');
        }
        return criteria;
    }

    async updateCriteria(id: string, dto: UpdateCriteriaDto) {
        const existingCriteria = await this.prisma.criteria.findUnique({
            where: { id },
        });
        if (!existingCriteria) {
            throw new NotFoundException('Criteria not found');
        }
        return this.prisma.criteria.update({
            where: { id },
            data: { ...dto },
        });
    }


    async deleteCriteria(id: string) {
        const existingCriteria = await this.prisma.criteria.findUnique({
            where: { id },
        });
        if (!existingCriteria) {
            throw new NotFoundException('Criteria not found');
        }
        return this.prisma.criteria.delete({ where: { id } });
    }


    async countCriteria() {
        return this.prisma.criteria.count();
    }
}

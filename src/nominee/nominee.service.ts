import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNomineeDto, UpdateNomineeDto } from './dto';
import { Course } from '@prisma/client';

@Injectable()
export class NomineeService {
    constructor(private prisma: PrismaService) { }

    async createNominee(dto: CreateNomineeDto) {
        const existingNominee = await this.prisma.nominee.findUnique({
            where: { email: dto.email },
        });
        if (existingNominee) {
            throw new ConflictException('A nominee with this email already exists.');
        }

        const nomineeData = {
            ...dto,
            rollNo:dto.rollNo,
            course: dto.course as Course,
        };

        return this.prisma.nominee.create({ data: nomineeData });
    }

    async getNomineeById(id: string) {
        const nominee = await this.prisma.nominee.findUnique({ where: { id } });
        if (!nominee) {
            throw new NotFoundException('Nominee not found');
        }
        return nominee;
    }

    async updateNominee(id: string, dto: UpdateNomineeDto) {
        const nominee = await this.prisma.nominee.findUnique({ where: { id } });
        if (!nominee) {
            throw new NotFoundException('Nominee not found');
        }

        const updateData: {
            name?: string;
            email?: string;
            phone?: string;
            course?: Course;
            graduationYear?: number;
            relationshipWithNominator?: string;
            currentEmployment?: string;
            linkedInProfile?: string;
        } = {};

        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.email !== undefined) updateData.email = dto.email;
        if (dto.phone !== undefined) updateData.phone = dto.phone;
        if (dto.course !== undefined) updateData.course = dto.course as Course;
        if (dto.graduationYear !== undefined) updateData.graduationYear = dto.graduationYear;
        if (dto.relationshipWithNominator !== undefined) updateData.relationshipWithNominator = dto.relationshipWithNominator;
        if (dto.currentEmployment !== undefined) updateData.currentEmployment = dto.currentEmployment;
        if (dto.linkedInProfile !== undefined) updateData.linkedInProfile = dto.linkedInProfile;

        return this.prisma.nominee.update({
            where: { id },
            data: updateData,
        });
    }

    async deleteNominee(id: string) {
        const nominee = await this.prisma.nominee.findUnique({ where: { id } });
        if (!nominee) {
            throw new NotFoundException('Nominee not found');
        }
        return this.prisma.nominee.delete({ where: { id } });
    }

    async getAllNominees() {
        return this.prisma.nominee.findMany({})
    }
}

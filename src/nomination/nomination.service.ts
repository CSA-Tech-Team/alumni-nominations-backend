import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominationDto } from './dto/createnomination.dto';
import { NomineeType, Course } from '@prisma/client';

@Injectable()
export class NominationService {
  constructor(private prisma: PrismaService) {}

  async createNomination(dto: CreateNominationDto) {
    // Ensure all criteria have been answered.
    const criteriaCount = await this.prisma.criteria.count();
    if (dto.answers.length !== criteriaCount) {
      throw new BadRequestException('You must answer all criteria questions');
    }

    // Validate that the user exists.
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let nomineeId: string | undefined = undefined;

    if (dto.nomineeType === NomineeType.OTHERS) {
      if (!dto.nominee) {
        throw new BadRequestException('Nominee details are required for OTHERS nomination');
      }

      // Check if a nominee with the given email exists.
      const existingNominee = await this.prisma.nominee.findUnique({
        where: { email: dto.nominee.email },
      });

      if (existingNominee) {
        // Check if any nomination already exists with this nominee.
        const existingNomination = await this.prisma.nomination.findFirst({
          where: { nomineeId: existingNominee.id },
        });
        if (existingNomination) {
          throw new BadRequestException('This nominee has already been nominated.');
        }
        nomineeId = existingNominee.id;
      } else {
        // Create nominee record using the provided details.
        const nomineeData = {
          ...dto.nominee,
          // Get rollNo from the nominee object.
          rollNo: dto.nominee.rollNo,
          // Cast course to the Course enum.
          course: dto.nominee.course as Course,
        };
        const nominee = await this.prisma.nominee.create({ data: nomineeData });
        nomineeId = nominee.id;
      }
    }

    // Prepare nomination data (include nomineeId only for OTHERS nomination).
    const nominationData: any = {
      userId: dto.userId,
      nomineeType: dto.nomineeType,
      answers: {
        create: dto.answers.map((answer) => ({
          criteriaId: answer.criteriaId,
          response: answer.response,
        })),
      },
      ...(dto.nomineeType === NomineeType.OTHERS && { nomineeId }),
    };

    // Create the nomination record.
    const nomination = await this.prisma.nomination.create({
      data: nominationData,
      include: { answers: true },
    });
    return nomination;
  }

  async getNominationById(id: string) {
    const nomination = await this.prisma.nomination.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!nomination) {
      throw new NotFoundException('Nomination not found');
    }
    return nomination;
  }
}

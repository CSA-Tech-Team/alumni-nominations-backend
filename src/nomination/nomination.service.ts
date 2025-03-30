import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominationDto } from './dto/createnomination.dto';
import { NomineeType, Course } from '@prisma/client';

@Injectable()
export class NominationService {
  constructor(private prisma: PrismaService) { }

  async createNomination(dto: CreateNominationDto) {
    // Validate that each provided criteriaId exists.
    const criteria = await this.prisma.criteria.findMany({ select: { id: true } });
    const criteriaIdSet = new Set(criteria.map(c => c.id));
    if (dto.answers.length !== criteria.length) {
      throw new BadRequestException('You must answer all criteria questions');
    }
    for (const answer of dto.answers) {
      if (!criteriaIdSet.has(answer.criteriaId)) {
        throw new BadRequestException(`Invalid criteriaId: ${answer.criteriaId}`);
      }
    }

    // Validate that the nominating user exists.
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For self-nomination, ensure the user hasn't already nominated themselves.
    if (dto.nomineeType === NomineeType.MYSELF) {
      const existingSelfNomination = await this.prisma.nomination.findFirst({
        where: { userId: dto.userId, nomineeType: NomineeType.MYSELF },
      });
      if (existingSelfNomination) {
        throw new BadRequestException('You have already nominated yourself.');
      }
    }

    let nomineeId: string | undefined;
    let nominatedEmail: string;

    if (dto.nomineeType === NomineeType.OTHERS) {
      if (!dto.nominee) {
        throw new BadRequestException('Nominee details are required for OTHERS nomination');
      }
      // Check if a nominee exists by email.
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
        nominatedEmail = existingNominee.email;
      } else {
        // Create nominee record using the provided details.
        const newNominee = await this.prisma.nominee.create({
          data: {
            ...dto.nominee,
            // Cast course to the Course enum.
            course: dto.nominee.course as Course,
          },
        });
        nomineeId = newNominee.id;
        nominatedEmail = newNominee.email;
      }
    } else {
      // For self-nomination, use the user's email.
      nominatedEmail = user.email;
    }

    // Prepare nomination data, including nominatedYear.
    const nominationData: any = {
      userId: dto.userId,
      nomineeType: dto.nomineeType,
      nominatedYear: dto.nominatedYear,
      answers: {
        create: dto.answers.map(answer => ({
          criteriaId: answer.criteriaId,
          response: answer.response,
        })),
      },
      ...(dto.nomineeType === NomineeType.OTHERS && { nomineeId }),
    };

    const nomination = await this.prisma.nomination.create({
      data: nominationData,
      include: { answers: true },
    });
    return { nomination, nominatedEmail };
  }

  async getNominationById(id: string) {
    const nomination = await this.prisma.nomination.findUnique({
      where: { id },
      include: {
        answers: true,
        user: true,
        nominee: true,
      },
    });
    if (!nomination) {
      throw new NotFoundException('Nomination not found');
    }
    let nominatedEmail: string;
    if (nomination.nomineeType === NomineeType.MYSELF) {
      nominatedEmail = nomination.user.email;
    } else {
      nominatedEmail = nomination.nominee?.email || "";
    }
    if (!nominatedEmail) {
      throw new BadRequestException('Email not found');
    }
    return { ...nomination, nominatedEmail };
  }

  async getNominationsByYear(year: number) {
    const nominations = await this.prisma.nomination.findMany({
      where: { nominatedYear: year },
      include: {
        answers: true,
        user: true,
        nominee: true,
      },
    });
    return nominations;
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominationDto } from './dto/createnomination.dto';
import { NomineeType, Course } from '@prisma/client';

@Injectable()
export class NominationService {
  constructor(private prisma: PrismaService) { }

  async createNomination(dto: CreateNominationDto) {
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

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.nomineeType === NomineeType.MYSELF) {
      const existingSelfNomination = await this.prisma.nomination.findFirst({
        where: { userId: dto.userId, nomineeType: NomineeType.MYSELF },
      });
      if (existingSelfNomination) {
        throw new BadRequestException('You have already nominated yourself.');
      }
      if (!user.profile || !user.profile.rollNo) {
        throw new BadRequestException('Your profile must be complete with a roll number.');
      }
    }

    let nomineeId: string | undefined;
    let rollNo: string;

    if (dto.nomineeType === NomineeType.OTHERS) {
      if (!dto.nominee) {
        throw new BadRequestException('Nominee details are required for OTHERS nomination');
      }

      const existingNominee = await this.prisma.nominee.findFirst({
        where: {
          OR: [
            { email: dto.nominee.email },
            { rollNo: dto.nominee.rollNo },
          ],
        },
      });
      if (existingNominee) {
        const existingNomination = await this.prisma.nomination.findFirst({
          where: { nomineeId: existingNominee.id },
        });
        if (existingNomination) {
          throw new BadRequestException('This nominee has already been nominated.');
        }
        nomineeId = existingNominee.id;
        rollNo = existingNominee.rollNo;
      } else {
        const newNominee = await this.prisma.nominee.create({
          data: {
            ...dto.nominee,
            course: dto.nominee.course as Course,
          },
        });
        nomineeId = newNominee.id;
        rollNo = newNominee.rollNo;
      }
    } else {
      rollNo = user.profile!.rollNo;
    }

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
    return { nomination, rollNo };
  }

  async getNominationById(id: string) {
    const nomination = await this.prisma.nomination.findUnique({
      where: { id },
      include: {
        answers: true,
        user: { include: { profile: true } },
        nominee: true,
      },
    });
    if (!nomination) {
      throw new NotFoundException('Nomination not found');
    }
    let rollNo: string;
    if (nomination.nomineeType === NomineeType.MYSELF) {
      rollNo = nomination.user.profile?.rollNo || "";
    } else {
      rollNo = nomination.nominee?.rollNo || "";
    }
    if (!rollNo) {
      throw new BadRequestException('Roll number not found');
    }
    return { ...nomination, rollNo };
  }

  async getNominationsByYear(year: number) {
    const nominations = await this.prisma.nomination.findMany({
      where: { nominatedYear: year },
      include: {
        answers: true,
        user: { include: { profile: true } },
        nominee: true,
      },
    });
    return nominations;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NomineeType, User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getUsersWithNominationDetails() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profile: {
          select: {
            phone: true,
            linkedInProfile: true,
            resumeUrl: true,
            rollNo: true, // include rollNo from user's profile
          },
        },
        nominations: {
          select: {
            id: true,
            userId: true,
            nomineeType: true,
            nomineeId: true,
            nominatedYear: true,
            answers: {
              select: {
                id: true,
                response: true,
                criteria: {
                  select: { text: true },
                },
              },
            },
            nominee: {
              select: { rollNo: true }, // include nominee's rollNo
            },
          },
        },
      },
    });

    const modifiedUsers = users.map(user => ({
      ...user,
      nominations: user.nominations.map(nomination => {
        let nominatedRollNo = '';
        if (nomination.nomineeType === 'MYSELF') {
          if (user.profile) {
            nominatedRollNo = user.profile.rollNo;
          } else {
            nominatedRollNo = ""
          }
        } else {
          nominatedRollNo = nomination.nominee?.rollNo || '';
        }
        return { ...nomination, nominatedRollNo };
      }),
    }));

    return modifiedUsers;
  }

  async getNominationCountByRollNo(usr: User) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: usr.id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }
    const count = await this.prisma.nomination.count({
      where: {
        OR: [
          {
            nomineeType: 'MYSELF',
            user: {
              profile: {
                rollNo: profile.rollNo,
              },
            },
          },
          {
            nomineeType: 'OTHERS',
            nominee: {
              rollNo: profile.rollNo,
            },
          },
        ],
      },
    });
    return { rollNo: profile.rollNo, nominationCount: count };
  }

  async getNominationCountsForAllRollNos(): Promise<{ rollNo: string; nominationCount: number }[]> {
    const profileRollNos = await this.prisma.profile.findMany({
      select: { rollNo: true },
      distinct: ['rollNo'],
    });

    const nomineeRollNos = await this.prisma.nominee.findMany({
      select: { rollNo: true },
      distinct: ['rollNo'],
    });

    const allRollNos = new Set([
      ...profileRollNos.map((p) => p.rollNo),
      ...nomineeRollNos.map((n) => n.rollNo),
    ]);

    const nominationCounts: { rollNo: string; nominationCount: number }[] = [];

    for (const rollNo of allRollNos) {
      const count = await this.prisma.nomination.count({
        where: {
          OR: [
            {
              nomineeType: NomineeType.MYSELF,
              user: {
                profile: {
                  rollNo: rollNo,
                },
              },
            },
            {
              nomineeType: NomineeType.OTHERS,
              nominee: {
                rollNo: rollNo,
              },
            },
          ],
        },
      });
      nominationCounts.push({ rollNo, nominationCount: count });
    }

    return nominationCounts;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getUsersWithNominationDetails() {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profile: {
          select: {
            phone: true,
            linkedInProfile: true,
            resumeUrl: true,
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
              select: { email: true },
            },
          },
        },
      },
    });

    const modifiedUsers = users.map(user => ({
      ...user,
      nominations: user.nominations.map(nomination => {
        let nominatedEmail = '';
        if (nomination.nomineeType === 'MYSELF') {
          nominatedEmail = user.email;
        } else {
          nominatedEmail = nomination.nominee?.email || '';
        }
        return { ...nomination, nominatedEmail };
      }),
    }));

    return modifiedUsers;
  }


  async getNominationCountByEmail(usr: User) {
    const email = usr.email;
    const count = await this.prisma.nomination.count({
      where: {
        OR: [
          {
            nomineeType: 'MYSELF',
            user: {
              email: email,
            },
          },
          {
            nomineeType: 'OTHERS',
            nominee: {
              email: email,
            },
          },
        ],
      },
    });
    return { email, nominationCount: count };
  }

  async getNominationCountsForAllEmails(): Promise<{ email: string; nominationCount: number }[]> {
    const userEmails = await this.prisma.user.findMany({
      where: { role: 'USER' },
      select: { email: true },
      distinct: ['email'],
    });

    const nomineeEmails = await this.prisma.nominee.findMany({
      select: { email: true },
      distinct: ['email'],
    });

    const allEmails = new Set([
      ...userEmails.map(u => u.email),
      ...nomineeEmails.map(n => n.email),
    ]);

    const nominationCounts: { email: string; nominationCount: number }[] = [];

    for (const email of allEmails) {
      const count = await this.prisma.nomination.count({
        where: {
          OR: [
            {
              nomineeType: 'MYSELF',
              user: {
                email: email,
                role: 'USER', 
              },
            },
            {
              nomineeType: 'OTHERS',
              nominee: {
                email: email,
              },
              user: {
                role: 'USER', 
              },
            },
          ],
        },
      });

      nominationCounts.push({ email, nominationCount: count });
    }

    return nominationCounts;
  }

}

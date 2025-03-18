import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
                    },
                },
                nominations: {
                    include: {
                        answers: {
                            select: {
                                id: true,
                                response: true,
                                criteria: {
                                    select: { text: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        return users;
    }
}


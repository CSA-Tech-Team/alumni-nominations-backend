import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async createProfile(dto: CreateProfileDto, userId: string) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isProfileComplete: true
        },
      });
      throw new BadRequestException('Profile already exists for this user');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isProfileComplete: true
      },
    });
    return this.prisma.profile.create({
      data: { ...dto, userId },
    });
  }


  async updateProfile(profileId: string, dto: UpdateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { profileId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { profileId },
      data: { ...dto },
    });
  }


  async getProfileById(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    return profile;
  }
}

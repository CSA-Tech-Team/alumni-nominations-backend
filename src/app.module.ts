import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { NominationModule } from './nomination/nomination.module';
import { CriteriaModule } from './criteria/criteria.module';
import { NomineeModule } from './nominee/nominee.module';
import { AdminModule } from './admin/admin.module';

@Module({
  // config module for envs
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), AuthModule, UserModule, PrismaModule, ProfileModule, NominationModule, CriteriaModule, NomineeModule, AdminModule]
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { NomineeService } from './nominee.service';
import { NomineeController } from './nominee.controller';

@Module({
  controllers: [NomineeController],
  providers: [NomineeService],
})
export class NomineeModule {}

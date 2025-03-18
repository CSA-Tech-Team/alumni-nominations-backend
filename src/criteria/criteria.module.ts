import { Module } from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';

@Module({
  controllers: [CriteriaController],
  providers: [CriteriaService],
})
export class CriteriaModule {}

import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCriteriaDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class UpdateCriteriaDto extends PartialType(CreateCriteriaDto) {}

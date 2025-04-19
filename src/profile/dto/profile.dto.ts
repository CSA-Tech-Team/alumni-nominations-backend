import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Course } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  course: Course;
  
  @IsString()
  rollNo: string

  @IsNotEmpty()
  @IsNumber()
  graduationYear: number;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsString()
  linkedInProfile: string;

  @IsNotEmpty()
  @IsString()
  resumeUrl: string;

  // @IsNotEmpty()
  // @IsString()
  // userId: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) { }

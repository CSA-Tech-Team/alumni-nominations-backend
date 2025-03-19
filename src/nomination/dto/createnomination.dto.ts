import { IsNotEmpty, IsEnum, IsOptional, IsArray, ValidateNested, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NomineeType } from '@prisma/client';

class CreateAnswerDto {
    @IsNotEmpty()
    criteriaId: string;

    @IsNotEmpty()
    response: string;
}

class CreateNomineeDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsString()
    rollNo: string;

    @IsNotEmpty()
    email: string;

    @IsOptional()
    phone?: string;

    @IsNotEmpty()
    course: string;

    @IsNotEmpty()
    graduationYear: number;

    @IsNotEmpty()
    relationshipWithNominator: string;

    @IsNotEmpty()
    currentEmployment: string;

    @IsNotEmpty()
    linkedInProfile: string;
}

export class CreateNominationDto {
    @IsNotEmpty()
    userId: string;

    // New: the year in which the nomination is made.
    @IsNotEmpty()
    @IsInt()
    @Min(1900)
    nominatedYear: number;

    @IsEnum(NomineeType)
    nomineeType: NomineeType;

    // Only needed if nomineeType is OTHERS.
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateNomineeDto)
    nominee?: CreateNomineeDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto[];
}

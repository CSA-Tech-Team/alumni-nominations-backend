import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { PartialType } from "@nestjs/mapped-types"
export class CreateNomineeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsString()
    @IsNotEmpty()
    rollNo: string

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNotEmpty()
    @IsString()
    course: string;

    @IsNotEmpty()
    @IsNumber()
    graduationYear: number;

    @IsNotEmpty()
    @IsString()
    relationshipWithNominator: string;

    @IsNotEmpty()
    @IsString()
    currentEmployment: string;

    @IsNotEmpty()
    @IsString()
    linkedInProfile: string;
}

export class UpdateNomineeDto extends PartialType(CreateNomineeDto) { }


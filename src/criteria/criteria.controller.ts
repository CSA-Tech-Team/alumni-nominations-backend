import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import { CreateCriteriaDto, UpdateCriteriaDto } from './dto/criteria.dto';
import { JwtGuard } from 'src/guards';
import { UserDecorator } from 'src/decorator';
import { User } from '@prisma/client';

@Controller('criteria')
@UseGuards(JwtGuard)
export class CriteriaController {
  constructor(private criteriaService: CriteriaService) { }

  @Post()
  async create(@Body() createCriteriaDto: CreateCriteriaDto, @UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("Should be an admin to create criteria qns", HttpStatus.UNAUTHORIZED)
    }
    return this.criteriaService.createCriteria(createCriteriaDto);
  }

  @Get()
  async findAll() {
    return this.criteriaService.getAllCriteria();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCriteriaDto: UpdateCriteriaDto, @UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("Should be an admin to update criteria qns", HttpStatus.UNAUTHORIZED)
    }
    return this.criteriaService.updateCriteria(id, updateCriteriaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("Should be an admin to delete criteria qns", HttpStatus.UNAUTHORIZED)
    }
    return this.criteriaService.deleteCriteria(id);
  }
}

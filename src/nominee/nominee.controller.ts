import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { NomineeService } from './nominee.service';
import { CreateNomineeDto, UpdateNomineeDto } from './dto/index';

@Controller('nominees')
export class NomineeController {
  constructor(private nomineeService: NomineeService) { }

  @Post()
  async create(@Body() createNomineeDto: CreateNomineeDto) {
    return this.nomineeService.createNominee(createNomineeDto);
  }

  @Get("all")
  async getAllNominees() {
    return this.nomineeService.getAllNominees()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nomineeService.getNomineeById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNomineeDto: UpdateNomineeDto) {
    return this.nomineeService.updateNominee(id, updateNomineeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.nomineeService.deleteNominee(id);
  }
}

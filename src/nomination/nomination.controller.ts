import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NominationService } from './nomination.service';
import { CreateNominationDto } from './dto/createnomination.dto';

@Controller('nominations')
export class NominationController {
  constructor(private nominationService: NominationService) { }

  @Post()
  async create(@Body() createNominationDto: CreateNominationDto) {
    return this.nominationService.createNomination(createNominationDto);
  }

  @Get(':id')
  async getNomination(@Param('id') id: string) {
    return this.nominationService.getNominationById(id);
  }
}

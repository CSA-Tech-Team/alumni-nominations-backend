import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/index';
import { JwtGuard } from 'src/guards';
import { UserDecorator } from 'src/decorator';

@UseGuards(JwtGuard)
@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) { }

  @Post()
  async create(@Body() createProfileDto: CreateProfileDto, @UserDecorator() usr) {
    return this.profileService.createProfile(createProfileDto, usr.id);
  }

  @Get("byuserId")
  async getProfilebyUserId(@UserDecorator() usr) {
    return this.profileService.getProfileByUserId(usr.id)
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfileById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(id, updateProfileDto);
  }

}

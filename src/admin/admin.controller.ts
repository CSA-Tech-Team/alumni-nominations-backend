import { Controller, Get, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from 'src/guards';
import { User } from '@prisma/client';
import { UserDecorator } from 'src/decorator';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get("")
  async getAllUsers(@UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("User is not authorized to access this website", HttpStatus.UNAUTHORIZED)
    }
    return this.adminService.getUsersWithNominationDetails()
  }

  @Get("nominationCountByRollNo")
  async nominationCountByRollNo(@UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("User is not authorized to access this website", HttpStatus.UNAUTHORIZED)
    }

    return this.adminService.getNominationCountByEmail(usr)
  }

  @Get('nominations')
  async totalNominations(@UserDecorator() usr: User) {
    if (usr.role !== "ADMIN") {
      throw new HttpException("User is not authorized to access this website", HttpStatus.UNAUTHORIZED)
    }
    return this.adminService.getNominationCountsForAllEmails()
  }

}

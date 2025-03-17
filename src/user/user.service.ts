import { Injectable } from '@nestjs/common';
import { EditUserDto } from './dto/edituser.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UserService {
    constructor(private primsa: PrismaService) { }
    async editUser(userId: string, dto: EditUserDto) {
        const { password: _removedPass,email:_email, ...dtoexceptpassandmail } = dto
        const user = await this.primsa.user.update({
            where: {
                id: userId,
            },
            data: {
                ...dtoexceptpassandmail
            }
        })
        const { password, ...expectPass } = user
        return { user: expectPass }
    }
}
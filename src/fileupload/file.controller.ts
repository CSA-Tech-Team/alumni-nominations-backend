import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    StreamableFile,
    Get,
    Param,
    Res,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Response } from 'express';
import { JwtGuard } from 'src/guards';
import { UserDecorator } from 'src/decorator';
import { User } from '@prisma/client';

@Controller('pdf')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload')
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadPdf(@UserDecorator() usr: User, @UploadedFile() file: Express.Multer.File) {
        const { id } = usr;
        if (!file) {
            throw new Error('File not found');
        }
        if (!file.mimetype.includes('pdf')) {
            throw new Error('File is not a PDF');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB');
        }
        // if (!file.originalname) {
        //     throw new Error('File name not found');
        // }
        const fileId = await this.fileService.upload(file);
        const url = `${process.env.BACKEND_URL}/pdf/files/${fileId}`;
        return { fileId, url };
    }

    @Get('files/:id')
    async getPdf(@Param('id') id: string, @Res() res: Response) {
        const downloadStream = this.fileService.getDownloadStream(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${id}.pdf"`,
        });

        downloadStream.pipe(res);
    }

}
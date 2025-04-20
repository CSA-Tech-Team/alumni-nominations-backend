import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class FileService implements OnModuleInit {
    private gfs: GridFSBucket;

    constructor(@InjectConnection() private readonly connection: Connection) { }

    onModuleInit() {
        if (!this.connection.db) {
            throw new Error('Database connection is not initialized');
        }
        this.gfs = new GridFSBucket(this.connection.db, { bucketName: 'resumes' });
    }

    async upload(file: Express.Multer.File): Promise<string> {
        const uploadStream = this.gfs.openUploadStream(file.originalname, {
            contentType: file.mimetype,
        });
        const readable = new Readable();
        readable.push(file.buffer);
        readable.push(null);

        await new Promise((resolve, reject) => {
            readable.pipe(uploadStream)
                .on('error', (err) => reject(err))
                .on('finish', () => resolve(null));
        });

        return uploadStream.id.toString();
    }

    
    getDownloadStream(id: string) {
        return this.gfs.openDownloadStream(new ObjectId(id));
      }
}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SignatureModule } from './signature/signature.module';
import { MailModule } from './mail/mail.module';
import { typeOrmConfig } from './db/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig), 
    SignatureModule,
    MailModule,
  ],
})
export class AppModule {}

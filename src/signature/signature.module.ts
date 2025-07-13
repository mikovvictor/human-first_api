import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signature } from './signature.entity';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Signature]), MailModule],
  providers: [SignatureService],
  controllers: [SignatureController],
})
export class SignatureModule {}

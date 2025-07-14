import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from './signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(Signature)
    private readonly signatureRepo: Repository<Signature>,
    private readonly mailService: MailService,
  ) {}

  async createSignature(dto: CreateSignatureDto) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    let existing;

    try {
      existing = await this.signatureRepo.findOne({ where: { email: dto.email } });
    } catch (error) {
      console.error('Error creating signature: ', error);
      throw error;
    }

    if (existing) {
      if (existing.isVerified) {
        throw new BadRequestException('Email already verified.');
      }

      existing.otpCode = otp;
      existing.otpExpiresAt = expiresAt;
      try {
        await this.signatureRepo.save(existing);
      } catch (error) {
        console.error('Error saving existing signature: ', error);
        throw error;
      }
    } else {
      const signature = this.signatureRepo.create({
        ...dto,
        otpCode: otp,
        otpExpiresAt: expiresAt,
      });
      try {
        await this.signatureRepo.save(signature);
      } catch (error) {
        console.error('Error saving new signature: ', error);
        throw error;
      }
    }

    try {
      await this.mailService.sendOtpEmail(dto.email, otp);
    } catch (error) {
      console.error('Error sending OTP email: ', error);
      throw error;
    }
    return { message: 'OTP sent to your email.' };
  }

  async verifyOtp(email: string, code: string) {
    const signature = await this.signatureRepo.findOne({ where: { email } });
    if (!signature || !signature.otpCode) {
      throw new NotFoundException('Invalid request.');
    }

    if (signature.isVerified) {
      throw new BadRequestException('Already verified.');
    }

    if (signature.otpCode !== code) {
      throw new BadRequestException('Incorrect OTP.');
    }

    if (signature.otpExpiresAt && new Date() > signature.otpExpiresAt) {
      throw new BadRequestException('OTP expired.');
    }

    signature.isVerified = true;
    signature.otpCode = null;
    signature.otpExpiresAt = null;
    await this.signatureRepo.save(signature);

    return { message: 'Signature verified successfully!' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  async countVerified(): Promise<number> {
    return this.signatureRepo.count({
      where: { isVerified: true },
    });
  }

  async getTopCountries(limit = 5): Promise<{ country: string; count: number }[]> {
    return this.signatureRepo
      .createQueryBuilder('signature')
      .select('signature.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('signature.isVerified = :verified', { verified: true })
      .groupBy('signature.country')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async subscribeToNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
    const user = await this.signatureRepo.findOne({ where: { email } });

    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    if (user.newsletterSubscribed) {
      return { success: true, message: 'Already subscribed' };
    }

    user.newsletterSubscribed = true;
    await this.signatureRepo.save(user);

    console.log('💌 Incoming newsletter subscription for:', email);

    return { success: true, message: 'Subscribed to newsletter' };
  }

 
  async getAllSubscribedEmails(): Promise<string[]> {
    const subscribers = await this.signatureRepo.find({
      where: { newsletterSubscribed: true },
      select: ['email'],
    });

    return subscribers.map(subscriber => subscriber.email);
  }
}

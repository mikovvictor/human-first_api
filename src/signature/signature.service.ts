import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from './signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(Signature)
    private readonly signatureRepo: Repository<Signature>,
    private readonly mailService: MailService,
  ) {}

  async createSignature(dto: CreateSignatureDto): Promise<{ success: boolean; message: string }> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    let existing: Signature | null = null;

    try {
      existing = await this.signatureRepo.findOne({ where: { email: dto.email } });
    } catch (error) {
      console.error('Error finding existing signature:', error);
      throw new BadRequestException('Could not process your request. Please try again.');
    }

    if (existing) {
      if (existing.isVerified) {
        return {
          success: true,
          message: 'Email is already verified. No further action needed.',
        };
      }

      existing.otpCode = otp;
      existing.otpExpiresAt = expiresAt;
      try {
        await this.signatureRepo.save(existing);
      } catch (error) {
        console.error('Error updating existing signature:', error);
        throw new BadRequestException('Could not update OTP. Please try again.');
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
        console.error('Error saving new signature:', error);
        throw new BadRequestException('Could not create signature. Please try again.');
      }
    }

    try {
      await this.mailService.sendOtpEmail(dto.email, otp);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        message: 'Failed to send OTP email. Please check your email address.',
      };
    }

    return { success: true, message: 'OTP sent to your email.' };
  }

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; message: string; signatureCount?: number }> {
    const signature = await this.signatureRepo.findOne({ where: { email } });

    if (!signature || !signature.otpCode) {
      return { success: false, message: 'Invalid or expired verification request.' };
    }

    if (signature.isVerified) {
      return { success: true, message: 'Email already verified.' };
    }

    if (signature.otpCode !== code) {
      return { success: false, message: 'Incorrect OTP code.' };
    }

    if (signature.otpExpiresAt && new Date() > signature.otpExpiresAt) {
      return { success: false, message: 'OTP code has expired.' };
    }

    signature.isVerified = true;
    signature.otpCode = null;
    signature.otpExpiresAt = null;
    await this.signatureRepo.save(signature);

    const signatureCount = await this.countVerified();

    return {
      success: true,
      message: 'Signature verified successfully!',
      signatureCount,
    };
  }

  async countVerified(): Promise<number> {
    const count = await this.signatureRepo.count({
      where: { isVerified: true },
    });
    return count + 9300;
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

  async subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.signatureRepo.findOne({ where: { email } });

    if (!user) {
      return { success: false, message: 'Email not found in our records.' };
    }

    if (user.newsletterSubscribed) {
      return { success: true, message: 'Already subscribed to the newsletter.' };
    }

    user.newsletterSubscribed = true;
    await this.signatureRepo.save(user);

    console.log('💌 Incoming newsletter subscription for:', email);

    return { success: true, message: 'Successfully subscribed to the newsletter.' };
  }

  async getAllSubscribedEmails(): Promise<string[]> {
    const subscribers = await this.signatureRepo.find({
      where: { newsletterSubscribed: true },
      select: ['email'],
    });

    return subscribers.map((subscriber) => subscriber.email);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

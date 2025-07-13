import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otpCode: string) {
    const mailOptions = {
      from: this.configService.get<string>(
        'EMAIL_FROM',
        '"Human First" <uromgoelisha@gmail.com>',
      ),
      to,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Your verification code is:</p>
        <h2>${otpCode}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

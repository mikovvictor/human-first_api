import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.resend.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: false, 
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
    //   host: this.configService.get<string>('SMTP_HOST', 'smtp.resend.com'),
    //   port: parseInt(this.configService.get<string>('SMTP_PORT', '465')),
    //   secure: true,
    //   auth: {
    //     user: this.configService.get<string>('SMTP_USER'),
    //     pass: this.configService.get<string>('SMTP_PASS'),
    //   },
    // });
  }

  async sendOtpEmail(to: string, otpCode: string) {
    console.log("Send OTP Email Params: ", "To: ", to, "OTP Code: ", otpCode)
    const mailOptions = {
      from: this.configService.get<string>(
        'EMAIL_FROM',
        'info@humansarefirst.org',
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
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email: ', error);
      throw error;
    }
  }
}

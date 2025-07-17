import { Controller, Post, Body, Get, Options, Res } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { Response } from 'express';

@Controller('signatures')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post()
  create(@Body() createSignatureDto: CreateSignatureDto) {
    return this.signatureService.createSignature(createSignatureDto);
  }

  @Post('verify')
  verify(@Body() body: { email: string; code: string }) {
    return this.signatureService.verifyOtp(body.email, body.code);
  }

  @Get('count-verified')
  async countVerified() {
    const count = await this.signatureService.countVerified();
    return { verifiedSignatures: count };
  }
  @Get('top-countries')
  async topCountries() {
    const countries = await this.signatureService.getTopCountries();
    return { topCountries: countries };
  }

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    console.log('💌 Incoming newsletter subscription for:', email);
    return this.signatureService.subscribeToNewsletter(email);
  }

  @Get('subscribers')
  async getSubscribers() {
    return this.signatureService.getAllSubscribedEmails();
  }

  @Options('*')
  handleGlobalPreflight(@Res() res: Response) {
    res.set({
      'Access-Control-Allow-Origin': 'https://humansarefirst.org',
      'Access-Control-Allow-Methods': [
        'https://humans-first.vercel.app',
        'http://localhost:3000',
        'https://humansarefirst.org',
        'https://preview--humans-first.lovable.app',
        'https://lovable.dev/projects/89347184-5342-4275-8513-4ad4bffbb34b',
        'https://89347184-5342-4275-8513-4ad4bffbb34b.lovableproject.com'
      ],
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.status(204).send();
}

}

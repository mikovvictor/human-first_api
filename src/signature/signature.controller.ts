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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.status(204).send();
}

}

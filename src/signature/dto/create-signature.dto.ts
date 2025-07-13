import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSignatureDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  newsletterSubscribed?: boolean;
}

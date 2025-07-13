import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Signature } from 'src/signature/signature.entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: parseInt(configService.get<string>('DB_PORT', '5432')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME', 'signature_db'),
    entities: [Signature],
    synchronize: true,
  }),
};

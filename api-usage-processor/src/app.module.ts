import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ConsentsModule } from './consents/consents.module';
import { DisclaimersModule } from './disclaimers/disclaimers.module';
import { LegalModule } from './legal/legal.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        ttl: parseInt(configService.get('RATE_LIMIT_TTL') || '60'),
        limit: parseInt(configService.get('RATE_LIMIT_MAX') || '60'),
        throttlers: [
          {
            name: 'burst',
            ttl: parseInt(configService.get('BURST_TTL') || '5'),
            limit: parseInt(configService.get('BURST_MAX') || '10'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    GuidelinesModule,
    EvaluationsModule,
    ConsentsModule,
    DisclaimersModule,
    LegalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

@Injectable()
export class DatabaseConfig {
  static getConfig(configService: ConfigService): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      autoLoadModels: true,
      synchronize: false, // We use migrations
      logging: configService.get('NODE_ENV') === 'development',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };
  }
}

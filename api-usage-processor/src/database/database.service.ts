import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { getConnectionToken } from '@nestjs/sequelize';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize
  ) {}

  async transaction<T>(fn: (transaction: any) => Promise<T>): Promise<T> {
    return this.sequelize.transaction(fn);
  }
}

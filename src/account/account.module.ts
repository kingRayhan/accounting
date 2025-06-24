import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { AccountController } from './account.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountController],
})
export class AccountModule {}

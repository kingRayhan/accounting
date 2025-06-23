import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContactController],
})
export class ContactModule {}

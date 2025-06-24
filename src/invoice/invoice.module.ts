import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
})
export class InvoiceModule {}

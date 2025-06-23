import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './contact/contact.module';
import { AccountModule } from './account/account.module';
import { QuoteModule } from './quote/quote.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PaymentModule } from './payment/payment.module';
import { CreditModule } from './credit/credit.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    ContactModule,
    AccountModule,
    QuoteModule,
    InvoiceModule,
    PaymentModule,
    CreditModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

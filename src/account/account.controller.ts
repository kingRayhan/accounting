import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { AccountTransactionDto, CreateAccountDto } from './account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get()
  async getAccounts(@Query('type') type?: string) {
    let query = `SELECT *,
      (select sum(amount) from account_transactions where account_id = accounts.id) as balance
      FROM accounts WHERE is_active = true ORDER BY name
    `;
    const params: any[] = [];

    if (type) {
      query = `
      SELECT *,
        (select sum(amount) from account_transactions where account_id = accounts.id) as balance,
        FROM accounts WHERE is_active = true AND account_type = $1 ORDER BY name`;
      params.push(type);
    }

    const result = await this.dbService.query(query, params);
    return { data: result.rows };
  }

  @Post()
  async createAccount(@Body() payload: CreateAccountDto) {
    const initialBalance = payload.initial_balance || 0;

    const queries: any[] = [
      {
        text: `INSERT INTO accounts (name, account_type, account_subtype) 
               VALUES ($1, $2, $3) 
               RETURNING *`,
        params: [payload.name, payload.account_type, payload.account_subtype],
      },
    ];

    // If there's an initial balance, create a transaction record
    if (initialBalance !== 0) {
      queries.push({
        text: `INSERT INTO account_transactions (account_id, transaction_type, amount, description, transaction_date)
               VALUES ((SELECT id FROM accounts WHERE name = $1), $2, $3, $4, CURRENT_DATE)`,
        params: [
          payload.name,
          initialBalance > 0 ? 'deposit' : 'withdrawal',
          initialBalance,
          'Initial balance',
        ],
      });
    }

    const results = await this.dbService.transaction(queries);
    return {
      message: 'Account created successfully',
      data: results.map((r) => r.rows),
    };
  }

  @Post('transactions')
  async createAccountTransaction(
    @Body() transactionDto: AccountTransactionDto,
  ) {
    // Verify account exists
    const accountResult = await this.dbService.query(
      'SELECT * FROM accounts WHERE id = $1',
      [transactionDto.account_id],
    );

    if (accountResult.rows.length === 0) {
      throw new NotFoundException('Account not found');
    }

    const transactionAmount = parseFloat(transactionDto.amount.toString());

    const results = await this.dbService.query(
      `INSERT INTO account_transactions (account_id, transaction_type, amount, description, reference_number, transaction_date)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING *`,
      [
        transactionDto.account_id,
        transactionDto.transaction_type,
        transactionAmount,
        transactionDto.description,
        transactionDto.reference_number,
        transactionDto.transaction_date,
      ],
    );
    return {
      message: 'Transaction recorded successfully',
      data: results.rows,
    };
  }

  @Get(':id/statements')
  async getAccountStatement(
    @Param('id') id: number,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    let query = `
      SELECT at.*, a.name as account_name
      FROM account_transactions at
      JOIN accounts a ON at.account_id = a.id
      WHERE at.account_id = $1
    `;
    const params: any[] = [id];
    let paramCount = 2;

    if (fromDate) {
      query += ` AND at.transaction_date >= $${paramCount}`;
      params.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      query += ` AND at.transaction_date <= $${paramCount}`;
      params.push(toDate);
      paramCount++;
    }

    query += ' ORDER BY at.transaction_date DESC, at.created_at DESC';

    const result = await this.dbService.query(query, params);

    // Get account details
    const accountResult = await this.dbService.query(
      'SELECT * FROM accounts WHERE id = $1',
      [id],
    );
    const calculationResult = await this.dbService.query(
      `
        SELECT
          total_deposit,
          total_withdrawal,
          (total_deposit - total_withdrawal) AS balance
        FROM (
          SELECT
            COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN amount END), 0) AS total_deposit,
            COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount END), 0) AS total_withdrawal
          FROM account_transactions
          WHERE account_id = $1
        ) AS sub;
      `,
      [id],
    );

    if (accountResult.rows.length === 0) {
      throw new NotFoundException('Account not found');
    }

    return {
      account: accountResult.rows[0],
      calculation: calculationResult.rows[0],
      transactions: result.rows,
    };
  }
}

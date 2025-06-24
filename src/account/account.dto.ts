import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

// Account DTOs
export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] })
  @IsEnum(['asset', 'liability', 'equity', 'revenue', 'expense'])
  account_type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  account_subtype?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  initial_balance?: number;
}

export class AccountTransactionDto {
  @ApiProperty()
  @IsNumber()
  account_id: number;

  @ApiProperty({ enum: ['deposit', 'withdrawal'] })
  @IsEnum(['deposit', 'withdrawal'])
  transaction_type: 'deposit' | 'withdrawal';

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiProperty()
  @IsDateString()
  transaction_date: string;
}

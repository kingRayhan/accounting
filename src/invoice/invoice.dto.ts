import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LineItemDto {
  @ApiProperty()
  @IsString()
  item_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  unit_price: number;
}

// Invoice DTOs
export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  invoice_number: string;

  @ApiProperty()
  @IsNumber()
  customer_id: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  quote_id?: number;

  @ApiProperty()
  @IsDateString()
  invoice_date: string;

  @ApiProperty()
  @IsDateString()
  due_date: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discount_percentage?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  tax_amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  line_items: LineItemDto[];
}

export class UpdateInvoiceDto {
  @ApiProperty()
  @IsOptional()
  @IsDateString()
  invoice_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discount_percentage?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  tax_amount?: number;

  @ApiProperty({
    enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: LineItemDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  line_items?: LineItemDto[];
}

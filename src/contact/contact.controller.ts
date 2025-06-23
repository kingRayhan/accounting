import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { CreateContactDto, UpdateContactDto } from './contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get(':type')
  async getContacts(
    @Param('type') type: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    if (!['customer', 'vendor'].includes(type)) {
      throw new BadRequestException('Type must be either customer or vendor');
    }

    const offset = (page - 1) * limit;

    const result = await this.dbService.query(
      `SELECT * FROM contacts 
       WHERE type = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [type, limit, offset],
    );

    const countResult = await this.dbService.query(
      'SELECT COUNT(*) FROM contacts WHERE type = $1',
      [type],
    );

    return {
      data: result.rows,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    };
  }

  @Post(':type')
  async createContact(
    @Param('type') type: string,
    @Body() payload: CreateContactDto,
  ) {
    if (!['customer', 'vendor'].includes(type)) {
      throw new BadRequestException('Type must be either customer or vendor');
    }

    const result = await this.dbService.query(
      `INSERT INTO contacts (name, email, phone, address, type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [payload.name, payload.email, payload.phone, payload.address, type],
    );

    return { message: 'Contact created successfully', data: result.rows[0] };
  }

  @Patch(':type/:id')
  async updateContact(
    @Param('type') type: string,
    @Param('id') id: number,
    @Body() payload: UpdateContactDto,
  ) {
    if (!['customer', 'vendor'].includes(type)) {
      throw new BadRequestException('Type must be either customer or vendor');
    }

    // Check if contact exists
    const existingContact = await this.dbService.query(
      'SELECT * FROM contacts WHERE id = $1 AND type = $2',
      [id, type],
    );

    if (existingContact.rows.length === 0) {
      throw new NotFoundException('Contact not found');
    }

    const updates: any[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.keys(payload).forEach((key) => {
      if (payload[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(payload[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.dbService.query(
      `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return { message: 'Contact updated successfully', data: result.rows[0] };
  }
}

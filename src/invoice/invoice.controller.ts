import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateInvoiceDto, LineItemDto } from './invoice.dto';
import { DatabaseService } from '../common/database/database.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly dbService: DatabaseService) {}

  private calculateTotals(
    lineItems: LineItemDto[],
    discountPercentage: number = 0,
    taxAmount: number = 0,
  ) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  }

  @Get()
  async getInvoices(@Query('status') status?: string) {
    let query = `
      SELECT i.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN contacts c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `;
    const params: any[] = [];

    if (status) {
      query = `
        SELECT i.*, c.name as customer_name, c.email as customer_email
        FROM invoices i
        LEFT JOIN contacts c ON i.customer_id = c.id
        WHERE i.status = $1
        ORDER BY i.created_at DESC
      `;
      params.push(status);
    }

    const result = await this.dbService.query(query, params);
    return { data: result.rows };
  }

  @Get(':id')
  async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
    // Main invoice query with customer information
    const invoiceQuery = `
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        q.quote_number,
        q.quote_date
      FROM invoices i
      LEFT JOIN contacts c ON i.customer_id = c.id
      LEFT JOIN quotes q ON i.quote_id = q.id
      WHERE i.id = $1
    `;

    const invoiceResult = await this.dbService.query(invoiceQuery, [id]);

    if (invoiceResult.rows.length === 0) {
      throw new NotFoundException('Invoice not found');
    }

    const invoice = invoiceResult.rows[0];

    // Get line items
    const lineItemsQuery = `
      SELECT 
        id,
        item_name,
        description,
        quantity,
        unit_price,
        line_total,
        created_at
      FROM invoice_line_items
      WHERE invoice_id = $1
      ORDER BY id ASC
    `;

    const lineItemsResult = await this.dbService.query(lineItemsQuery, [id]);

    // Get payment history with allocations
    const paymentsQuery = `
      SELECT 
        p.id as payment_id,
        p.payment_number,
        p.payment_date,
        p.payment_method,
        p.reference_number,
        p.notes as payment_notes,
        pa.allocated_amount,
        pa.created_at as allocation_date
      FROM payments p
      INNER JOIN payment_allocations pa ON p.id = pa.payment_id
      WHERE pa.reference_type = 'invoice' AND pa.reference_id = $1
      ORDER BY p.payment_date DESC, p.created_at DESC
    `;

    const paymentsResult = await this.dbService.query(paymentsQuery, [id]);

    // Get account splits for payments related to this invoice
    const accountSplitsQuery = `
      SELECT 
        p.payment_number,
        pas.amount as split_amount,
        a.id as account_id,
        a.name as account_name,
        a.account_type
      FROM payments p
      INNER JOIN payment_allocations pa ON p.id = pa.payment_id
      INNER JOIN payment_account_splits pas ON p.id = pas.payment_id
      INNER JOIN accounts a ON pas.account_id = a.id
      WHERE pa.reference_type = 'invoice' AND pa.reference_id = $1
      ORDER BY p.payment_date DESC
    `;

    const accountSplitsResult = await this.dbService.query(accountSplitsQuery, [
      id,
    ]);

    // Get any credits created from overpayments on this invoice
    const creditsQuery = `
      SELECT 
        c.id as credit_id,
        c.amount as credit_amount,
        c.source,
        c.description as credit_description,
        c.created_at as credit_date,
        p.payment_number
      FROM credits c
      LEFT JOIN payments p ON c.payment_id = p.id
      WHERE c.contact_id = $1 AND c.contact_type = 'customer'
        AND c.description LIKE '%' || $2 || '%'
      ORDER BY c.created_at DESC
    `;

    const creditsResult = await this.dbService.query(creditsQuery, [
      invoice.customer_id,
      invoice.invoice_number,
    ]);

    // Calculate aging information
    const currentDate = new Date();
    const dueDate = new Date(invoice.due_date);
    const daysPastDue = Math.floor(
      (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let agingBucket = 'current';
    if (daysPastDue > 0) {
      if (daysPastDue <= 30) agingBucket = '1-30';
      else if (daysPastDue <= 60) agingBucket = '31-60';
      else if (daysPastDue <= 90) agingBucket = '61-90';
      else agingBucket = '90+';
    }

    // Group account splits by payment
    const accountSplitsByPayment = accountSplitsResult.rows.reduce(
      (acc, split) => {
        if (!acc[split.payment_number]) {
          acc[split.payment_number] = [];
        }
        acc[split.payment_number].push({
          account_id: split.account_id,
          account_name: split.account_name,
          account_type: split.account_type,
          amount: parseFloat(split.split_amount),
        });
        return acc;
      },
      {},
    );

    // Enhance payments with account splits
    const enhancedPayments = paymentsResult.rows.map((payment) => ({
      payment_id: payment.payment_id,
      payment_number: payment.payment_number,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number,
      payment_notes: payment.payment_notes,
      allocated_amount: parseFloat(payment.allocated_amount),
      allocation_date: payment.allocation_date,
      account_splits: accountSplitsByPayment[payment.payment_number] || [],
    }));

    // Calculate totals
    const totalAllocated = enhancedPayments.reduce(
      (sum, payment) => sum + payment.allocated_amount,
      0,
    );

    // Build comprehensive response
    const response = {
      // Basic invoice information
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      status: invoice.status,
      notes: invoice.notes,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,

      // Customer information
      customer: {
        id: invoice.customer_id,
        name: invoice.customer_name,
        email: invoice.customer_email,
        phone: invoice.customer_phone,
        address: invoice.customer_address,
      },

      // Quote reference (if applicable)
      quote: invoice.quote_id
        ? {
            id: invoice.quote_id,
            quote_number: invoice.quote_number,
            quote_date: invoice.quote_date,
          }
        : null,

      // Financial totals
      totals: {
        subtotal: parseFloat(invoice.subtotal),
        discount_percentage: parseFloat(invoice.discount_percentage),
        discount_amount: parseFloat(invoice.discount_amount),
        tax_amount: parseFloat(invoice.tax_amount),
        total_amount: parseFloat(invoice.total_amount),
        paid_amount: parseFloat(invoice.paid_amount),
        balance_due: parseFloat(invoice.balance_due),
      },

      // Line items
      line_items: lineItemsResult.rows.map((item) => ({
        id: item.id,
        item_name: item.item_name,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        line_total: parseFloat(item.line_total),
        created_at: item.created_at,
      })),

      // Payment history
      payments: enhancedPayments,

      // Payment summary
      payment_summary: {
        total_payments: enhancedPayments.length,
        total_allocated: parseFloat(totalAllocated.toFixed(2)),
        remaining_balance: parseFloat(invoice.balance_due),
      },

      // Credits from overpayments
      credits: creditsResult.rows.map((credit) => ({
        id: credit.credit_id,
        amount: parseFloat(credit.credit_amount),
        source: credit.source,
        description: credit.credit_description,
        payment_number: credit.payment_number,
        created_at: credit.credit_date,
      })),

      // Aging information
      aging: {
        days_past_due: Math.max(0, daysPastDue),
        aging_bucket: agingBucket,
        is_overdue: daysPastDue > 0 && parseFloat(invoice.balance_due) > 0,
      },
    };

    return { data: response };
  }

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    // Verify customer exists
    const customerResult = await this.dbService.query(
      'SELECT * FROM contacts WHERE id = $1 AND type = $2',
      [createInvoiceDto.customer_id, 'customer'],
    );

    if (customerResult.rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }

    const { subtotal, discountAmount, totalAmount } = this.calculateTotals(
      createInvoiceDto.line_items,
      createInvoiceDto.discount_percentage || 0,
      createInvoiceDto.tax_amount || 0,
    );

    const queries = [
      {
        text: `INSERT INTO invoices (invoice_number, customer_id, quote_id, invoice_date, due_date, subtotal, discount_percentage, discount_amount, tax_amount, total_amount, balance_due, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               RETURNING *`,
        params: [
          createInvoiceDto.invoice_number,
          createInvoiceDto.customer_id,
          createInvoiceDto.quote_id,
          createInvoiceDto.invoice_date,
          createInvoiceDto.due_date,
          subtotal,
          createInvoiceDto.discount_percentage || 0,
          discountAmount,
          createInvoiceDto.tax_amount || 0,
          totalAmount,
          totalAmount,
          createInvoiceDto.notes,
        ],
      },
    ];

    // Add line items
    createInvoiceDto.line_items.forEach((item) => {
      const lineTotal = item.quantity * item.unit_price;
      queries.push({
        text: `INSERT INTO invoice_line_items (invoice_id, item_name, description, quantity, unit_price, line_total)
               VALUES ((SELECT id FROM invoices WHERE invoice_number = $1), $2, $3, $4, $5, $6)`,
        params: [
          createInvoiceDto.invoice_number,
          item.item_name,
          item.description,
          item.quantity,
          item.unit_price,
          lineTotal,
        ],
      });
    });

    const results = await this.dbService.transaction(queries);
    return {
      message: 'Invoice created successfully',
      data: results[0].rows[0],
    };
  }
}

# Software Requirements Specification (SRS)
## Accounting Management Application

**Version:** 1.0  
**Date:** June 23, 2025  
**Project:** Accounting Management System  
**Document Type:** Software Requirements Specification

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Requirements](#5-system-requirements)
6. [Database Design](#6-database-design)
7. [API Specifications](#7-api-specifications)
8. [Data Validation Requirements](#8-data-validation-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Appendices](#10-appendices)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for an Accounting Management Application similar to ZohoBooks, designed to manage customers, vendors, quotes, invoices, bills, payments, and financial accounts with comprehensive reporting capabilities.

### 1.2 Document Conventions
- **API Endpoints**: Documented in RESTful format
- **Data Types**: TypeScript/PostgreSQL compatible types
- **Status Codes**: HTTP standard status codes
- **Validation**: Class-validator decorators specified

### 1.3 Intended Audience
- Development Team
- QA Engineers
- Product Managers
- System Administrators
- API Consumers

### 1.4 Project Scope
The application provides complete accounting functionality including:
- Contact management (customers/vendors)
- Financial account management with chart of accounts
- Quote and invoice lifecycle management
- Bill and payment processing
- Multi-invoice payments with multi-account splits
- Comprehensive reporting and analytics

---

## 2. Overall Description

### 2.1 Product Perspective
The system is a standalone web-based accounting application built with:
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL
- **Architecture**: RESTful API with modular controller structure
- **Validation**: Class-validator with DTO pattern

### 2.2 Product Functions
#### Core Modules:
1. **Contact Management**: Customer and vendor CRUD operations
2. **Account Management**: Chart of accounts with transaction tracking
3. **Quote Management**: Quote creation, modification, and conversion to invoices
4. **Invoice Management**: Invoice lifecycle with payment tracking
5. **Bill Management**: Vendor bill processing and payment
6. **Payment Processing**: Multi-allocation payments across accounts
7. **Reporting**: Financial reports and analytics
8. **Credit Management**: Automatic overpayment handling

### 2.3 User Classes and Characteristics
- **Accountants**: Primary users managing daily accounting operations
- **Business Owners**: Users reviewing reports and financial summaries
- **API Consumers**: External systems integrating with the accounting data

### 2.4 Operating Environment
- **Server**: Node.js runtime environment
- **Database**: PostgreSQL 12+
- **API**: RESTful HTTP/HTTPS endpoints
- **Format**: JSON request/response format

---

## 3. System Features

### 3.1 Contact Management
**Description**: Manage customer and vendor information with CRUD operations.

**Functional Requirements**:
- FR-CM-001: Create new customers and vendors
- FR-CM-002: Update existing contact information
- FR-CM-003: Retrieve contact lists with pagination
- FR-CM-004: Validate email formats and required fields
- FR-CM-005: Separate customer and vendor endpoints

### 3.2 Account Management
**Description**: Manage chart of accounts with automatic balance tracking.

**Functional Requirements**:
- FR-AM-001: Create accounts with initial balances
- FR-AM-002: Record direct deposits and withdrawals
- FR-AM-003: Generate account statements with date filtering
- FR-AM-004: Automatically update account balances on transactions
- FR-AM-005: Support multiple account types (asset, liability, equity, revenue, expense)

### 3.3 Quote Management
**Description**: Create and manage quotes with line items and conversion capabilities.

**Functional Requirements**:
- FR-QM-001: Create quotes with multiple line items
- FR-QM-002: Calculate totals with discounts and taxes
- FR-QM-003: Update quote status and information
- FR-QM-004: Convert quotes to invoices
- FR-QM-005: Track quote expiry dates

### 3.4 Invoice Management
**Description**: Complete invoice lifecycle management with payment tracking.

**Functional Requirements**:
- FR-IM-001: Create invoices manually or from quotes
- FR-IM-002: Track payment status and balances
- FR-IM-003: Record partial and full payments
- FR-IM-004: Automatically update invoice status based on payments
- FR-IM-005: Handle overpayments as customer credits

### 3.5 Bill Management
**Description**: Vendor bill processing and payment tracking.

**Functional Requirements**:
- FR-BM-001: Create vendor bills with line items
- FR-BM-002: Track bill payment status
- FR-BM-003: Record bill payments with account allocation
- FR-BM-004: Handle overpayments as vendor credits
- FR-BM-005: Calculate due dates and aging

### 3.6 Payment Processing
**Description**: Advanced payment allocation across multiple invoices/bills and accounts.

**Functional Requirements**:
- FR-PP-001: Allocate single payment across multiple invoices/bills
- FR-PP-002: Split payments across multiple bank accounts
- FR-PP-003: Validate payment allocation totals
- FR-PP-004: Automatically create credits for overpayments
- FR-PP-005: Update account balances on payment processing

### 3.7 Reporting System
**Description**: Financial reporting and analytics dashboard.

**Functional Requirements**:
- FR-RS-001: Generate dashboard with key metrics
- FR-RS-002: Create aging reports for receivables/payables
- FR-RS-003: Produce profit & loss statements
- FR-RS-004: Track account balances and transactions
- FR-RS-005: Filter reports by date ranges

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- RESTful API endpoints (no GUI specified)
- JSON request/response format
- HTTP status code responses

### 4.2 Hardware Interfaces
- Standard server hardware capable of running Node.js
- Network interface for HTTP/HTTPS communication

### 4.3 Software Interfaces
- **Database**: PostgreSQL 12+ with connection pooling
- **Runtime**: Node.js 16+ environment
- **Framework**: NestJS with TypeScript support

### 4.4 Communication Interfaces
- HTTP/HTTPS protocols
- JSON data exchange format
- RESTful API architecture

---

## 5. System Requirements

### 5.1 Functional Requirements Summary
The system shall provide complete accounting functionality including contact management, financial account tracking, quote/invoice lifecycle, bill processing, advanced payment allocation, and comprehensive reporting.

### 5.2 Business Rules
- BR-001: Invoice numbers must be unique across the system
- BR-002: Quote numbers must be unique across the system
- BR-003: Payment allocations must equal account split totals
- BR-004: Account balances are automatically calculated
- BR-005: Overpayments create customer/vendor credits
- BR-006: Invoice status updates automatically based on payment amounts

---

## 6. Database Design

### 6.1 Core Tables

#### 6.1.1 contacts
Stores customer and vendor information.
```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'vendor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.2 accounts
Chart of accounts with balance tracking.
```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    account_subtype VARCHAR(50),
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.3 quotes
Quote header information.
```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES contacts(id),
    quote_date DATE NOT NULL,
    expiry_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.4 invoices
Invoice header information with payment tracking.
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES contacts(id),
    quote_id INTEGER REFERENCES quotes(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.5 payments
Payment header with multi-allocation support.
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 Relationship Tables

#### 6.2.1 payment_allocations
Links payments to specific invoices/bills.
```sql
CREATE TABLE payment_allocations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('invoice', 'bill')),
    reference_id INTEGER NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.2.2 payment_account_splits
Splits payment amounts across multiple accounts.
```sql
CREATE TABLE payment_account_splits (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. API Specifications

### 7.1 Contact Management APIs

#### 7.1.1 Get Contacts
**Endpoint**: `GET /api/{type}`  
**Parameters**: 
- `type`: customer | vendor (path parameter)
- `page`: number (query, default: 1)
- `limit`: number (query, default: 50)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "type": "customer",
      "created_at": "2025-06-23T10:00:00Z",
      "updated_at": "2025-06-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid type parameter
- 500: Server error

#### 7.1.2 Create Contact
**Endpoint**: `POST /api/{type}`  
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Validation Rules**:
- `name`: Required, string, max 255 characters
- `email`: Optional, valid email format
- `phone`: Optional, string, max 50 characters
- `address`: Optional, text

**Response**:
```json
{
  "message": "Contact created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "type": "customer",
    "created_at": "2025-06-23T10:00:00Z",
    "updated_at": "2025-06-23T10:00:00Z"
  }
}
```

**Status Codes**:
- 201: Created successfully
- 400: Validation error or invalid type
- 500: Server error

#### 7.1.3 Update Contact
**Endpoint**: `PATCH /api/{type}/{id}`  
**Request Body**:
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response**:
```json
{
  "message": "Contact updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "type": "customer",
    "created_at": "2025-06-23T10:00:00Z",
    "updated_at": "2025-06-23T11:00:00Z"
  }
}
```

**Status Codes**:
- 200: Updated successfully
- 400: Validation error or no fields to update
- 404: Contact not found
- 500: Server error

### 7.2 Account Management APIs

#### 7.2.1 Get Accounts
**Endpoint**: `GET /api/accounts`  
**Parameters**:
- `type`: account_type filter (query, optional)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "City Bank Checking",
      "account_type": "asset",
      "account_subtype": "checking",
      "initial_balance": "50000.00",
      "current_balance": "52500.00",
      "is_active": true,
      "created_at": "2025-06-23T10:00:00Z",
      "updated_at": "2025-06-23T10:00:00Z"
    }
  ]
}
```

#### 7.2.2 Create Account
**Endpoint**: `POST /api/accounts`  
**Request Body**:
```json
{
  "name": "City Bank Checking",
  "account_type": "asset",
  "account_subtype": "checking",
  "initial_balance": 50000
}
```

**Validation Rules**:
- `name`: Required, string, max 255 characters
- `account_type`: Required, enum: ['asset', 'liability', 'equity', 'revenue', 'expense']
- `account_subtype`: Optional, string, max 50 characters
- `initial_balance`: Optional, number, default 0

#### 7.2.3 Create Account Transaction
**Endpoint**: `POST /api/accounts/transactions`  
**Request Body**:
```json
{
  "account_id": 1,
  "transaction_type": "deposit",
  "amount": 5000,
  "description": "Monthly revenue deposit",
  "reference_number": "DEP-001",
  "transaction_date": "2025-06-23"
}
```

**Validation Rules**:
- `account_id`: Required, number, must exist
- `transaction_type`: Required, enum: ['deposit', 'withdrawal']
- `amount`: Required, positive number
- `description`: Optional, string
- `reference_number`: Optional, string
- `transaction_date`: Required, date string (YYYY-MM-DD)

#### 7.2.4 Get Account Statement
**Endpoint**: `GET /api/accounts/{id}/statement`  
**Parameters**:
- `id`: account ID (path parameter)
- `from`: start date (query, optional, YYYY-MM-DD)
- `to`: end date (query, optional, YYYY-MM-DD)

**Response**:
```json
{
  "account": {
    "id": 1,
    "name": "City Bank Checking",
    "account_type": "asset",
    "current_balance": "52500.00"
  },
  "transactions": [
    {
      "id": 1,
      "transaction_type": "deposit",
      "amount": "5000.00",
      "description": "Monthly revenue deposit",
      "reference_number": "DEP-001",
      "transaction_date": "2025-06-23",
      "created_at": "2025-06-23T10:00:00Z"
    }
  ]
}
```

### 7.3 Quote Management APIs

#### 7.3.1 Get Quotes
**Endpoint**: `GET /api/quotes`  
**Parameters**:
- `status`: quote status filter (query, optional)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "quote_number": "QUO-001",
      "customer_id": 1,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "quote_date": "2025-06-23",
      "expiry_date": "2025-07-23",
      "subtotal": "6500.00",
      "discount_percentage": "10.00",
      "discount_amount": "650.00",
      "tax_amount": "100.00",
      "total_amount": "5950.00",
      "status": "draft",
      "notes": "Initial quote for services",
      "created_at": "2025-06-23T10:00:00Z",
      "updated_at": "2025-06-23T10:00:00Z"
    }
  ]
}
```

#### 7.3.2 Create Quote
**Endpoint**: `POST /api/quotes`  
**Request Body**:
```json
{
  "quote_number": "QUO-001",
  "customer_id": 1,
  "quote_date": "2025-06-23",
  "expiry_date": "2025-07-23",
  "discount_percentage": 10,
  "tax_amount": 100,
  "notes": "Initial quote for services",
  "line_items": [
    {
      "item_name": "Web Development",
      "description": "Custom website development",
      "quantity": 1,
      "unit_price": 5000
    },
    {
      "item_name": "SEO Optimization",
      "description": "Search engine optimization",
      "quantity": 3,
      "unit_price": 500
    }
  ]
}
```

**Validation Rules**:
- `quote_number`: Required, string, unique, max 100 characters
- `customer_id`: Required, number, must reference existing customer
- `quote_date`: Required, date string (YYYY-MM-DD)
- `expiry_date`: Optional, date string (YYYY-MM-DD)
- `discount_percentage`: Optional, number, min 0, max 100
- `tax_amount`: Optional, number, min 0
- `notes`: Optional, text
- `line_items`: Required, array, min 1 item
  - `item_name`: Required, string, max 255 characters
  - `description`: Optional, text
  - `quantity`: Required, positive number
  - `unit_price`: Required, positive number

#### 7.3.3 Convert Quote to Invoice
**Endpoint**: `POST /api/quotes/turn-invoice`  
**Request Body**:
```json
{
  "quote_id": 1,
  "invoice_number": "INV-001",
  "invoice_date": "2025-06-23",
  "due_date": "2025-07-23"
}
```

**Response**:
```json
{
  "message": "Invoice created from quote successfully",
  "data": {
    "id": 1,
    "invoice_number": "INV-001",
    "customer_id": 1,
    "quote_id": 1,
    "invoice_date": "2025-06-23",
    "due_date": "2025-07-23",
    "total_amount": "5950.00",
    "balance_due": "5950.00",
    "status": "draft"
  }
}
```

#### 7.3.4 Update Quote
**Endpoint**: `PATCH /api/quotes/{id}`  
**Request Body**:
```json
{
  "expiry_date": "2025-08-23",
  "status": "sent",
  "line_items": [
    {
      "item_name": "Updated Web Development",
      "description": "Enhanced custom website development",
      "quantity": 1,
      "unit_price": 6000
    }
  ]
}
```

### 7.4 Invoice Management APIs

#### 7.4.1 Get Invoices
**Endpoint**: `GET /api/invoices`  
**Parameters**:
- `status`: invoice status filter (query, optional)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-001",
      "customer_id": 1,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "quote_id": 1,
      "invoice_date": "2025-06-23",
      "due_date": "2025-07-23",
      "subtotal": "6500.00",
      "discount_percentage": "10.00",
      "discount_amount": "650.00",
      "tax_amount": "100.00",
      "total_amount": "5950.00",
      "paid_amount": "0.00",
      "balance_due": "5950.00",
      "status": "draft",
      "notes": "Initial quote for services",
      "created_at": "2025-06-23T10:00:00Z",
      "updated_at": "2025-06-23T10:00:00Z"
    }
  ]
}
```

#### 7.4.2 Create Invoice
**Endpoint**: `POST /api/invoices`  
**Request Body**:
```json
{
  "invoice_number": "INV-002",
  "customer_id": 1,
  "invoice_date": "2025-06-23",
  "due_date": "2025-07-23",
  "discount_percentage": 5,
  "tax_amount": 150,
  "notes": "Direct invoice creation",
  "line_items": [
    {
      "item_name": "Consulting Services",
      "description": "Business consulting",
      "quantity": 10,
      "unit_price": 200
    }
  ]
}
```

#### 7.4.3 Update Invoice
**Endpoint**: `PATCH /api/invoices/{id}`  
**Request Body**:
```json
{
  "due_date": "2025-08-23",
  "status": "sent",
  "notes": "Updated payment terms"
}
```

#### 7.4.4 Record Invoice Payment
**Endpoint**: `POST /api/invoices/{id}/payments`  
**Request Body**:
```json
{
  "amount": 3000,
  "payment_date": "2025-06-25",
  "payment_method": "Bank Transfer",
  "reference_number": "TXN-12345",
  "notes": "Partial payment received"
}
```

**Response**:
```json
{
  "message": "Payment recorded successfully",
  "payment": {
    "id": 1,
    "payment_number": "PAY-1719144000000",
    "payment_date": "2025-06-25",
    "total_amount": "3000.00",
    "payment_method": "Bank Transfer",
    "reference_number": "TXN-12345"
  },
  "invoice": {
    "id": 1,
    "invoice_number": "INV-001",
    "paid_amount": "3000.00",
    "balance_due": "2950.00",
    "status": "partial"
  },
  "credit": 0
}
```

### 7.5 Bill Management APIs

#### 7.5.1 Get Bills
**Endpoint**: `GET /api/bills`  
**Parameters**:
- `status`: bill status filter (query, optional)

**Response Format**: Similar to invoices but with vendor information

#### 7.5.2 Create Bill
**Endpoint**: `POST /api/bills`  
**Request Body**:
```json
{
  "bill_number": "BILL-001",
  "vendor_id": 1,
  "bill_date": "2025-06-20",
  "due_date": "2025-07-20",
  "tax_amount": 50,
  "line_items": [
    {
      "item_name": "Office Supplies",
      "description": "Monthly office supplies",
      "quantity": 1,
      "unit_price": 500
    }
  ]
}
```

#### 7.5.3 Update Bill
**Endpoint**: `PATCH /api/bills/{id}`

#### 7.5.4 Record Bill Payment
**Endpoint**: `POST /api/bills/{id}/payments`

### 7.6 Payment Management APIs

#### 7.6.1 Create Multi-Allocation Payment
**Endpoint**: `POST /api/payments`  
**Request Body**:
```json
{
  "payment_number": "PAY-001",
  "payment_date": "2025-06-23",
  "payment_method": "Bank Transfer",
  "reference_number": "TXN-12345",
  "notes": "Payment for multiple invoices",
  "allocations": [
    {
      "reference_type": "invoice",
      "reference_id": 1,
      "allocated_amount": 1000
    },
    {
      "reference_type": "invoice",
      "reference_id": 2,
      "allocated_amount": 2000
    },
    {
      "reference_type": "bill",
      "reference_id": 1,
      "allocated_amount": 500
    }
  ],
  "account_splits": [
    {
      "account_id": 1,
      "amount": 2500
    },
    {
      "account_id": 2,
      "amount": 1000
    }
  ]
}
```

**Validation Rules**:
- `payment_number`: Required, string, unique, max 100 characters
- `payment_date`: Required, date string (YYYY-MM-DD)
- `payment_method`: Optional, string, max 50 characters
- `reference_number`: Optional, string, max 100 characters
- `notes`: Optional, text
- `allocations`: Required, array, min 1 item
  - `reference_type`: Required, enum: ['invoice', 'bill']
  - `reference_id`: Required, number, must exist
  - `allocated_amount`: Required, positive number
- `account_splits`: Required, array, min 1 item
  - `account_id`: Required, number, must exist
  - `amount`: Required, positive number

**Business Rule**: Total allocated amount must equal total account splits amount

**Response**:
```json
{
  "message": "Payment recorded successfully",
  "payment": {
    "id": 1,
    "payment_number": "PAY-001",
    "payment_date": "2025-06-23",
    "total_amount": "3500.00",
    "payment_method": "Bank Transfer",
    "reference_number": "TXN-12345"
  },
  "total_credits_created": 250.00
}
```

#### 7.6.2 Get Payments
**Endpoint**: `GET /api/payments`  
**Parameters**:
- `page`: number (query, default: 1)
- `limit`: number (query, default: 50)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "payment_number": "PAY-001",
      "payment_date": "2025-06-23",
      "total_amount": "3500.00",
      "payment_method": "Bank Transfer",
      "reference_number": "TXN-12345",
      "allocations": [
        {
          "allocation_id": 1,
          "reference_type": "invoice",
          "reference_id": 1,
          "allocated_amount": "1000.00"
        }
      ],
      "account_splits": [
        {
          "split_id": 1,
          "account_id": 1,
          "account_name": "City Bank Checking",
          "amount": "2500.00"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

#### 7.6.3 Get Payment Details
**Endpoint**: `GET /api/payments/{id}`  
**Response**: Detailed payment information with related invoice/bill details

### 7.7 Credit Management APIs

#### 7.7.1 Get Credits
**Endpoint**: `GET /api/credits`  
**Parameters**:
- `contact_type`: customer | vendor (query, optional)
- `contact_id`: number (query, optional)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 1,
      "contact_type": "customer",
      "contact_name": "John Doe",
      "contact_email": "john@example.com",
      "amount": "250.00",
      "source": "overpayment",
      "payment_id": 1,
      "payment_number": "PAY-001",
      "description": "Overpayment on invoice INV-001",
      "created_at": "2025-06-23T10:00:00Z"
    }
  ]
}
```

#### 7.7.2 Create Manual Credit
**Endpoint**: `POST /api/credits`  
**Request Body**:
```json
{
  "contact_id": 1,
  "contact_type": "customer",
  "amount": 500,
  "description": "Promotional credit for loyal customer"
}
```

**Validation Rules**:
- `contact_id`: Required, number, must exist
- `contact_type`: Required, enum: ['customer', 'vendor']
- `amount`: Required, positive number
- `description`: Required, string

**Response**:
```json
{
  "message": "Credit created successfully",
  "data": {
    "id": 2,
    "contact_id": 1,
    "contact_type": "customer",
    "amount": "500.00",
    "source": "manual",
    "description": "Promotional credit for loyal customer",
    "created_at": "2025-06-23T11:00:00Z"
  }
}
```

### 7.8 Reporting APIs

#### 7.8.1 Dashboard Summary
**Endpoint**: `GET /api/reports/dashboard`  
**Response**:
```json
{
  "invoice_summary": {
    "total_invoices": "15",
    "total_invoice_amount": "125000.00",
    "total_paid_amount": "95000.00",
    "total_outstanding": "30000.00"
  },
  "bill_summary": {
    "total_bills": "8",
    "total_bill_amount": "45000.00",
    "total_bill_paid": "40000.00",
    "total_bill_outstanding": "5000.00"
  },
  "account_summary": [
    {
      "account_type": "asset",
      "account_count": "3",
      "total_balance": "175000.00"
    },
    {
      "account_type": "liability",
      "account_count": "2",
      "total_balance": "25000.00"
    }
  ],
  "recent_invoices": [
    {
      "id": 1,
      "invoice_number": "INV-001",
      "customer_name": "John Doe",
      "total_amount": "5950.00",
      "balance_due": "2950.00",
      "status": "partial",
      "due_date": "2025-07-23"
    }
  ],
  "recent_payments": [
    {
      "id": 1,
      "payment_number": "PAY-001",
      "payment_date": "2025-06-23",
      "total_amount": "3500.00",
      "payment_method": "Bank Transfer"
    }
  ]
}
```

#### 7.8.2 Aging Report
**Endpoint**: `GET /api/reports/aging-report`  
**Parameters**:
- `type`: receivables | payables (query, default: receivables)

**Response**:
```json
{
  "type": "receivables",
  "summary": {
    "current": 15000.00,
    "1-30": 8000.00,
    "31-60": 5000.00,
    "61-90": 2000.00,
    "90+": 1500.00,
    "total": 31500.00
  },
  "details": {
    "current": [
      {
        "id": 1,
        "invoice_number": "INV-001",
        "invoice_date": "2025-06-23",
        "due_date": "2025-07-23",
        "total_amount": "5950.00",
        "balance_due": "2950.00",
        "customer_name": "John Doe",
        "aging_bucket": "current",
        "days_overdue": null
      }
    ],
    "1-30": [],
    "31-60": [],
    "61-90": [],
    "90+": []
  }
}
```

#### 7.8.3 Profit & Loss Report
**Endpoint**: `GET /api/reports/profit-loss`  
**Parameters**:
- `from`: start date (query, required, YYYY-MM-DD)
- `to`: end date (query, required, YYYY-MM-DD)

**Response**:
```json
{
  "period": {
    "from": "2025-06-01",
    "to": "2025-06-30"
  },
  "revenue": 125000.00,
  "expenses": 45000.00,
  "net_income": 80000.00,
  "profit_margin": 64.0
}
```

---

## 8. Data Validation Requirements

### 8.1 Input Validation Standards

#### 8.1.1 Required Field Validation
All API endpoints must validate required fields and return HTTP 400 with detailed error messages for missing required data.

#### 8.1.2 Data Type Validation
- **Numbers**: Must be valid decimal numbers with precision handling
- **Dates**: Must be in YYYY-MM-DD format
- **Emails**: Must follow standard email format validation
- **Enums**: Must match predefined values exactly

#### 8.1.3 Business Logic Validation
- **Unique Constraints**: Quote numbers, invoice numbers, bill numbers, payment numbers must be unique
- **Reference Integrity**: Foreign key references must exist in referenced tables
- **Amount Validation**: Payment allocations must equal account splits
- **Date Logic**: Due dates should be after invoice/bill dates
- **Positive Numbers**: Amounts, quantities, and prices must be positive

### 8.2 Error Response Format

#### 8.2.1 Validation Error Response
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email",
    "amount must be a positive number"
  ],
  "error": "Bad Request"
}
```

#### 8.2.2 Business Logic Error Response
```json
{
  "statusCode": 400,
  "message": "Total allocated amount must equal total account splits",
  "error": "Bad Request"
}
```

#### 8.2.3 Not Found Error Response
```json
{
  "statusCode": 404,
  "message": "Contact not found",
  "error": "Not Found"
}
```

---

## 9. Non-Functional Requirements

### 9.1 Performance Requirements
- **Response Time**: API endpoints should respond within 2 seconds under normal load
- **Throughput**: System should handle 100 concurrent users
- **Database**: Connection pooling must be implemented for efficient database access

### 9.2 Reliability Requirements
- **Availability**: 99.5% uptime during business hours
- **Data Integrity**: All financial calculations must be accurate to 2 decimal places
- **Transaction Safety**: Database transactions must maintain ACID properties

### 9.3 Security Requirements
- **Input Sanitization**: All user inputs must be sanitized to prevent injection attacks
- **Data Validation**: Server-side validation required for all inputs
- **Error Handling**: Sensitive information should not be exposed in error messages

### 9.4 Scalability Requirements
- **Database**: PostgreSQL with proper indexing for performance
- **Architecture**: Modular design allowing horizontal scaling
- **Connection Management**: Database connection pooling for resource efficiency

### 9.5 Maintainability Requirements
- **Code Quality**: TypeScript with strict typing and validation
- **Documentation**: Comprehensive API documentation with examples
- **Error Logging**: Detailed error logging for debugging and monitoring

---

## 10. Appendices

### 10.1 Status Code Reference

| Code | Description | Usage |
|------|-------------|--------|
| 200 | OK | Successful GET, PATCH requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Validation errors, business logic errors |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side errors |

### 10.2 Database Indexes

#### 10.2.1 Performance Indexes
```sql
-- Contacts
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Accounts
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- Quotes
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_date ON quotes(quote_date);

-- Invoices
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Bills
CREATE INDEX idx_bills_vendor ON bills(vendor_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);

-- Payments
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Payment Allocations
CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_reference ON payment_allocations(reference_type, reference_id);

-- Account Transactions
CREATE INDEX idx_account_transactions_account ON account_transactions(account_id);
CREATE INDEX idx_account_transactions_date ON account_transactions(transaction_date);
```

### 10.3 Sample API Workflows

#### 10.3.1 Complete Quote to Payment Workflow
1. **Create Customer**: `POST /api/customer`
2. **Create Bank Accounts**: `POST /api/accounts`
3. **Create Quote**: `POST /api/quotes`
4. **Convert to Invoice**: `POST /api/quotes/turn-invoice`
5. **Record Payment**: `POST /api/invoices/{id}/payments`
6. **View Dashboard**: `GET /api/reports/dashboard`

#### 10.3.2 Multi-Invoice Payment Workflow
1. **Create Multiple Invoices**: Multiple `POST /api/invoices`
2. **Create Multi-Payment**: `POST /api/payments`
   - Allocate across multiple invoices
   - Split across multiple accounts
3. **Handle Overpayments**: Automatic credit creation
4. **View Payment Details**: `GET /api/payments/{id}`

#### 10.3.3 Bill Payment Workflow
1. **Create Vendor**: `POST /api/vendor`
2. **Create Bill**: `POST /api/bills`
3. **Record Payment**: `POST /api/bills/{id}/payments`
4. **View Aging Report**: `GET /api/reports/aging-report?type=payables`

### 10.4 Data Migration Considerations

#### 10.4.1 Initial Data Setup
- Chart of accounts should be created before any transactions
- At least one bank account must exist before recording payments
- Customer/vendor records must exist before creating quotes/bills

#### 10.4.2 Data Import Format
All monetary values should be provided as numbers (not strings) in API requests and will be stored with 2 decimal precision in the database.

### 10.5 Environment Configuration

#### 10.5.1 Required Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=accounting_app
DB_USER=postgres
DB_PASSWORD=password
NODE_ENV=development
PORT=3000
```

#### 10.5.2 Database Setup Commands
```sql
-- Create database
CREATE DATABASE accounting_app;

-- Create user (optional)
CREATE USER accounting_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE accounting_app TO accounting_user;
```

### 10.6 Testing Requirements

#### 10.6.1 Unit Testing
- All service methods must have unit tests
- Validation logic must be thoroughly tested
- Business calculation methods require comprehensive test coverage

#### 10.6.2 Integration Testing
- API endpoint testing with various input scenarios
- Database transaction testing for data integrity
- Error handling and edge case testing

#### 10.6.3 Test Data Requirements
- Sample customers and vendors
- Sample chart of accounts
- Sample quotes, invoices, and bills
- Sample payment scenarios including overpayments

---

## Document Control

**Version History**:
- v1.0 - Initial SRS document with complete API specifications
- Created: June 23, 2025
- Last Modified: June 23, 2025

**Approval**:
- Technical Lead: [Pending]
- Product Manager: [Pending]
- QA Lead: [Pending]

**Distribution**:
- Development Team
- QA Team
- Product Management
- Technical Documentation

---

*This document serves as the complete technical specification for the Accounting Management Application. All development work should adhere to the requirements and specifications outlined in this document.*

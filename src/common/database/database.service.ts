import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  onModuleInit() {
    this.pool = new Pool({
      connectionString:
        'postgres://postgres:r5O5yixu9esTJf1KDIMbxDWPJWfhKbg2eWtLvekBT4q6q4QwRbWBqOIphXQwptEi@18.140.136.82:5432/accounting_application',
    });
  }

  async query(sql: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  async transaction(queries: Array<{ text: string; params?: any[] }>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const results: QueryResult[] = [];

      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

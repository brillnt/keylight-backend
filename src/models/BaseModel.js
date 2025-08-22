/**
 * Base Model Class
 * Provides common database operations for all models
 */

import { query } from '../config/database.js';
import { DatabaseError } from '../middleware/errorHandler.js';

export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Get the appropriate database connection based on environment
   */
  async getDbConnection() {
    if (process.env.NODE_ENV === 'test') {
      // In test environment, use knex connection for consistency with test setup
      const { db } = await import('../../tests/setup.js');
      return db;
    }
    // In production/development, use the regular pg.Pool connection
    return { query };
  }

  /**
   * Execute a query with error handling and environment-aware connection
   */
  async executeQuery(sql, params = []) {
    try {
      const connection = await this.getDbConnection();
      
      if (process.env.NODE_ENV === 'test') {
        // Convert PostgreSQL $1, $2... syntax to knex ? syntax for test environment
        let knexSql = sql;
        for (let i = 1; i <= params.length; i++) {
          knexSql = knexSql.replace(`$${i}`, '?');
        }
        
        // Use knex raw query in test environment
        const result = await connection.raw(knexSql, params);
        return result.rows;
      } else {
        // Use regular pg.Pool query in production/development
        const result = await connection.query(sql, params);
        return result;
      }
    } catch (error) {
      console.error(`Database query failed: ${sql}`, error);
      throw new DatabaseError(`Database operation failed: ${error.message}`, error);
    }
  }

  /**
   * Find a single record by ID
   */
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.executeQuery(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all records with optional conditions
   */
  async findAll(conditions = {}, orderBy = 'created_at DESC', limit = null) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];
    let paramCount = 0;

    // Add WHERE conditions
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => {
        paramCount++;
        params.push(conditions[key]);
        return `${key} = $${paramCount}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    // Add ORDER BY
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    // Add LIMIT
    if (limit) {
      paramCount++;
      params.push(limit);
      sql += ` LIMIT $${paramCount}`;
    }

    const result = await this.executeQuery(sql, params);
    return result.rows;
  }

  /**
   * Count records with optional conditions
   */
  async count(conditions = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];
    let paramCount = 0;

    // Add WHERE conditions
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => {
        paramCount++;
        params.push(conditions[key]);
        return `${key} = $${paramCount}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    const result = await this.executeQuery(sql, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Create a new record
   */
  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.executeQuery(sql, values);
    return result.rows[0];
  }

  /**
   * Update a record by ID
   */
  async updateById(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery(sql, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const result = await this.executeQuery(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Check if a record exists
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Find records with pagination
   */
  async paginate(page = 1, pageSize = 10, conditions = {}, orderBy = 'created_at DESC') {
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const totalCount = await this.count(conditions);
    
    // Get paginated results
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];
    let paramCount = 0;

    // Add WHERE conditions
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => {
        paramCount++;
        params.push(conditions[key]);
        return `${key} = $${paramCount}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    // Add ORDER BY, LIMIT, OFFSET
    sql += ` ORDER BY ${orderBy} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(pageSize, offset);

    const result = await this.executeQuery(sql, params);
    
    return {
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page < Math.ceil(totalCount / pageSize),
        hasPrev: page > 1
      }
    };
  }
}

export default BaseModel;


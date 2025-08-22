/**
 * User Model
 * Handles user account data operations and relationships
 */

import { BaseModel } from './BaseModel.js';
import { ValidationError, DatabaseError } from '../middleware/errorHandler.js';

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Get the appropriate database client (for test compatibility)
   */
  async _getDbClient() {
    // In test environment, use the same connection as our tests
    if (process.env.NODE_ENV === 'test') {
      // Import knex dynamically to avoid circular dependencies
      const knex = (await import('knex')).default;
      const config = (await import('../../knexfile.mjs')).default;
      return knex(config.test);
    }
    // In production, use BaseModel's executeQuery
    return null;
  }

  /**
   * Execute query with test-compatible database client
   */
  async _executeCompatibleQuery(sql, params = []) {
    const testDb = await this._getDbClient();
    if (testDb) {
      // Convert PostgreSQL $1 syntax to knex binding style for tests
      let knexSql = sql;
      params.forEach((param, index) => {
        knexSql = knexSql.replace(`$${index + 1}`, '?');
      });
      const result = await testDb.raw(knexSql, params);
      return { rows: result.rows }; // Return in standardized format
    }
    
    // Use BaseModel's standardized method for all environments
    return super.executeQuery(sql, params);
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {Object} - { isValid: boolean, error?: string }
   */
  validateEmail(email) {
    // Handle edge cases first
    if (email == null || email === undefined) {
      return { isValid: false, error: 'Invalid email format: email cannot be null or undefined' };
    }

    if (typeof email !== 'string') {
      return { isValid: false, error: 'Invalid email format: email must be a string' };
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail === '') {
      return { isValid: false, error: 'Invalid email format: email cannot be empty' };
    }

    // Email regex pattern - comprehensive but not overly restrictive
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Additional checks for common invalid patterns
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return { isValid: false, error: 'Invalid email format: invalid dot placement' };
    }

    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format: does not match required pattern' };
    }

    return { isValid: true };
  }

  /**
   * Static method to validate email without instantiating UserModel
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid, false if invalid
   */
  static isValidEmail(email) {
    // Optimized static implementation - no instance creation needed
    if (email == null || email === undefined || typeof email !== 'string') {
      return false;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail === '') {
      return false;
    }

    // Email regex pattern - comprehensive but not overly restrictive
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Check for invalid dot placement
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return false;
    }

    return emailRegex.test(trimmedEmail);
  }

  /**
   * Static method to get detailed email validation (bonus feature!)
   * @param {string} email - Email to validate
   * @returns {Object} - { isValid: boolean, error?: string }
   */
  static validateEmailDetailed(email) {
    const tempUserModel = new UserModel();
    return tempUserModel.validateEmail(email);
  }

  /**
   * Check if an email exists in the database
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if email exists, false otherwise
   */
  async emailExists(email) {
    try {
      // Handle edge cases
      if (!email || typeof email !== 'string') {
        return false;
      }

      const trimmedEmail = email.trim();
      if (trimmedEmail === '') {
        return false;
      }

      // Use case-insensitive search with PostgreSQL syntax
      const result = await this.executeQuery(
        'SELECT COUNT(*) as count FROM users WHERE LOWER(email_address) = LOWER($1)',
        [trimmedEmail]
      );

      // Handle case where result might be empty or malformed
      if (!result || !result.rows || result.rows.length === 0 || !result.rows[0]) {
        return false;
      }

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  /**
   * Find a user by email address
   * @param {string} email - Email to search for
   * @returns {Promise<Object|null>} - User object if found, null otherwise
   */
  async findByEmail(email) {
    try {
      // Handle edge cases
      if (!email || typeof email !== 'string') {
        return null;
      }

      const trimmedEmail = email.trim();
      if (trimmedEmail === '') {
        return null;
      }

      // Use case-insensitive search with PostgreSQL syntax
      const results = await this.executeQuery(
        'SELECT * FROM users WHERE LOWER(email_address) = LOWER($1) LIMIT 1',
        [trimmedEmail]
      );

      // Handle case where results might be empty or malformed
      if (!results || !results.rows || results.rows.length === 0) {
        return null;
      }

      return results.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Static method to check email existence without instantiating UserModel
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if email exists, false otherwise
   */
  static async emailExists(email) {
    try {
      const tempUserModel = new UserModel();
      return await tempUserModel.emailExists(email);
    } catch (error) {
      console.error('Error in static emailExists:', error);
      return false;
    }
  }

  /**
   * Get all users from the database
   * @returns {Promise<Array>} Array of user records
   */
  async findAll() {
    try {
      const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
      const result = await this.executeQuery(sql);
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // TODO: Add relationship queries (getUserProjects, getUserSubmissions)
  // TODO: Add search and filtering capabilities
  // TODO: Override create() and updateById() with validation
}

export default UserModel;

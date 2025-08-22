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

  /**
   * Get all projects for a specific user
   * @param {number} userId - User ID to get projects for
   * @returns {Promise<Array>} Array of user's projects
   */
  async getUserProjects(userId) {
    try {
      // Handle invalid user IDs
      if (!userId || isNaN(userId)) {
        return [];
      }

      // SQL query to join users and projects tables
      const sql = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.status,
          p.buyer_category,
          p.financing_plan,
          p.land_status,
          p.build_budget,
          p.construction_timeline,
          p.created_at,
          p.updated_at
        FROM projects p
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
      `;

      const result = await this.executeQuery(sql, [userId]);
      return result.rows || [];
    } catch (error) {
      console.error(`Error getting user projects for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all submissions for a specific user
   * @param {number} userId - User ID to get submissions for
   * @returns {Promise<Array>} Array of user's submissions
   */
  async getUserSubmissions(userId) {
    try {
      // Handle invalid user IDs
      if (!userId || isNaN(userId)) {
        return [];
      }

      // SQL query to get submissions for user, with optional project data
      const sql = `
        SELECT 
          s.id,
          s.full_name,
          s.email_address,
          s.phone_number,
          s.company_name,
          s.buyer_category,
          s.financing_plan,
          s.interested_in_preferred_lender,
          s.land_status,
          s.lot_address,
          s.needs_help_finding_land,
          s.preferred_area_description,
          s.build_budget,
          s.construction_timeline,
          s.project_description,
          s.status,
          s.admin_notes,
          s.referral_source,
          s.created_at,
          s.updated_at,
          s.project_id,
          p.name as project_name
        FROM intake_submissions s
        LEFT JOIN projects p ON s.project_id = p.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
      `;

      const result = await this.executeQuery(sql, [userId]);
      return result.rows || [];
    } catch (error) {
      console.error(`Error getting user submissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Static method to get user projects without instantiation
   * @param {number} userId - User ID to get projects for
   * @returns {Promise<Array>} Array of user's projects
   */
  static async getUserProjects(userId) {
    try {
      const tempUserModel = new UserModel();
      return await tempUserModel.getUserProjects(userId);
    } catch (error) {
      console.error('Error in static getUserProjects:', error);
      return [];
    }
  }

  /**
   * Static method to get user submissions without instantiation
   * @param {number} userId - User ID to get submissions for
   * @returns {Promise<Array>} Array of user's submissions
   */
  static async getUserSubmissions(userId) {
    try {
      const tempUserModel = new UserModel();
      return await tempUserModel.getUserSubmissions(userId);
    } catch (error) {
      console.error('Error in static getUserSubmissions:', error);
      return [];
    }
  }

  /**
   * Search users by email and/or name
   * @param {Object} criteria - Search criteria { email?: string, name?: string }
   * @returns {Promise<Array>} Array of matching users
   */
  async searchUsers(criteria) {
    try {
      // Handle invalid or empty criteria
      if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria)) {
        return [];
      }

      const { email, name } = criteria;
      
      // Return empty if no valid search criteria provided
      if (!email && !name) {
        return [];
      }

      let sql = `SELECT * FROM users WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      // Add email search (case-insensitive partial match)
      if (email && typeof email === 'string' && email.trim()) {
        sql += ` AND LOWER(email_address) ILIKE $${paramIndex}`;
        params.push(`%${email.toLowerCase().trim()}%`);
        paramIndex++;
      }

      // Add name search (case-insensitive partial match)
      if (name && typeof name === 'string' && name.trim()) {
        sql += ` AND LOWER(full_name) ILIKE $${paramIndex}`;
        params.push(`%${name.toLowerCase().trim()}%`);
        paramIndex++;
      }

      // Add ordering
      sql += ` ORDER BY full_name ASC`;

      const result = await this.executeQuery(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Find users with advanced filtering, pagination, and sorting
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of filtered users
   */
  async findUsersWithFilters(options = {}) {
    try {
      // Handle invalid options
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        return [];
      }

      const {
        limit = 50,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        createdAfter,
        createdBefore
      } = options;

      // Validate pagination parameters
      if (limit <= 0 || offset < 0) {
        return [];
      }

      // Validate sort parameters
      const allowedSortFields = ['full_name', 'email_address', 'created_at', 'updated_at'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const safeSortOrder = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

      let sql = `SELECT * FROM users WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      // Add date range filters
      if (createdAfter) {
        sql += ` AND created_at >= $${paramIndex}`;
        params.push(createdAfter);
        paramIndex++;
      }

      if (createdBefore) {
        sql += ` AND created_at <= $${paramIndex}`;
        params.push(createdBefore);
        paramIndex++;
      }

      // Add sorting, limit, and offset
      sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await this.executeQuery(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error filtering users:', error);
      return [];
    }
  }

  /**
   * Static method to search users without instantiation
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Array of matching users
   */
  static async searchUsers(criteria) {
    try {
      const tempUserModel = new UserModel();
      return await tempUserModel.searchUsers(criteria);
    } catch (error) {
      console.error('Error in static searchUsers:', error);
      return [];
    }
  }

  /**
   * Static method to find users with filters without instantiation
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of filtered users
   */
  static async findUsersWithFilters(options) {
    try {
      const tempUserModel = new UserModel();
      return await tempUserModel.findUsersWithFilters(options);
    } catch (error) {
      console.error('Error in static findUsersWithFilters:', error);
      return [];
    }
  }

  // TODO: Add search and filtering capabilities
  // TODO: Override create() and updateById() with validation
}

export default UserModel;

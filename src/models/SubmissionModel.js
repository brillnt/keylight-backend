/**
 * Submission Model
 * Handles intake submission data operations
 */

import { BaseModel } from './BaseModel.js';
import { ValidationError } from '../middleware/errorHandler.js';

export class SubmissionModel extends BaseModel {
  constructor() {
    super('intake_submissions');
  }

  /**
   * Validate submission data
   */
  validateSubmissionData(data) {
    const errors = [];

    // Required fields
    const requiredFields = [
      'full_name', 'email_address', 'phone_number',
      'buyer_category', 'financing_plan', 'land_status',
      'build_budget', 'construction_timeline', 'project_description'
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    // Email validation
    if (data.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_address)) {
      errors.push('email_address must be a valid email');
    }

    // Phone validation (basic)
    if (data.phone_number && !/^[\d\s\-\(\)\+\.]{10,}$/.test(data.phone_number)) {
      errors.push('phone_number must be a valid phone number');
    }

    // Enum validations
    const validBuyerCategories = ['homebuyer', 'developer'];
    if (data.buyer_category && !validBuyerCategories.includes(data.buyer_category)) {
      errors.push(`buyer_category must be one of: ${validBuyerCategories.join(', ')}`);
    }

    const validFinancingPlans = ['self_funding', 'finance_build'];
    if (data.financing_plan && !validFinancingPlans.includes(data.financing_plan)) {
      errors.push(`financing_plan must be one of: ${validFinancingPlans.join(', ')}`);
    }

    const validLandStatuses = ['own_land', 'need_land'];
    if (data.land_status && !validLandStatuses.includes(data.land_status)) {
      errors.push(`land_status must be one of: ${validLandStatuses.join(', ')}`);
    }

    const validBudgets = ['200k_250k', '250k_350k', '350k_400k', '400k_500k', '500k_plus'];
    if (data.build_budget && !validBudgets.includes(data.build_budget)) {
      errors.push(`build_budget must be one of: ${validBudgets.join(', ')}`);
    }

    const validTimelines = ['less_than_3_months', '3_to_6_months', '6_to_12_months', 'more_than_12_months'];
    if (data.construction_timeline && !validTimelines.includes(data.construction_timeline)) {
      errors.push(`construction_timeline must be one of: ${validTimelines.join(', ')}`);
    }

    // Conditional validations
    if (data.land_status === 'own_land' && !data.lot_address) {
      errors.push('lot_address is required when land_status is own_land');
    }

    if (data.land_status === 'need_land' && data.needs_help_finding_land === true && !data.preferred_area_description) {
      errors.push('preferred_area_description is required when needs_help_finding_land is true');
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return true;
  }

  /**
   * Sanitize submission data
   */
  sanitizeSubmissionData(data) {
    const sanitized = { ...data };

    // Trim string fields
    const stringFields = [
      'full_name', 'email_address', 'phone_number', 'company_name',
      'lot_address', 'preferred_area_description', 'project_description'
    ];

    stringFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
      }
    });

    // Normalize email
    if (sanitized.email_address) {
      sanitized.email_address = sanitized.email_address.toLowerCase();
    }

    // Set defaults
    sanitized.status = sanitized.status || 'new';
    sanitized.referral_source = sanitized.referral_source || 'Ritz-Craft';
    sanitized.interested_in_preferred_lender = sanitized.interested_in_preferred_lender || false;
    sanitized.needs_help_finding_land = sanitized.needs_help_finding_land || false;

    // Remove undefined/null values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === null) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  /**
   * Create a new submission with validation
   */
  async createSubmission(data) {
    // Sanitize data
    const sanitizedData = this.sanitizeSubmissionData(data);
    
    // Validate data
    this.validateSubmissionData(sanitizedData);

    // Check for duplicate email
    const existingSubmission = await this.findByEmail(sanitizedData.email_address);
    if (existingSubmission) {
      throw new ValidationError('A submission with this email already exists');
    }

    // Create submission
    return await this.create(sanitizedData);
  }

  /**
   * Find submission by email
   */
  async findByEmail(email) {
    const sql = `SELECT * FROM ${this.tableName} WHERE email_address = $1`;
    const result = await this.executeQuery(sql, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  /**
   * Update submission status
   */
  async updateStatus(id, status, adminNotes = null) {
    const validStatuses = ['new', 'reviewed', 'qualified', 'disqualified', 'contacted'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    return await this.updateById(id, updateData);
  }

  /**
   * Get submissions for admin dashboard
   */
  async getAdminDashboard(filters = {}, page = 1, pageSize = 20) {
    const conditions = {};

    // Apply filters
    if (filters.status) {
      conditions.status = filters.status;
    }
    if (filters.buyer_category) {
      conditions.buyer_category = filters.buyer_category;
    }
    if (filters.build_budget) {
      conditions.build_budget = filters.build_budget;
    }

    // Get paginated results
    const result = await this.paginate(page, pageSize, conditions, 'created_at DESC');

    // Add summary statistics
    const stats = await this.getSubmissionStats();

    return {
      ...result,
      stats
    };
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_count,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified_count,
        COUNT(*) FILTER (WHERE status = 'disqualified') as disqualified_count,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
        COUNT(*) FILTER (WHERE buyer_category = 'homebuyer') as homebuyer_count,
        COUNT(*) FILTER (WHERE buyer_category = 'developer') as developer_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_count
      FROM ${this.tableName}
    `;

    const result = await this.executeQuery(sql);
    return result.rows[0];
  }

  /**
   * Search submissions
   */
  async searchSubmissions(searchTerm, page = 1, pageSize = 20) {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE 
        full_name ILIKE $1 OR
        email_address ILIKE $1 OR
        company_name ILIKE $1 OR
        project_description ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const searchPattern = `%${searchTerm}%`;
    const offset = (page - 1) * pageSize;

    const result = await this.executeQuery(sql, [searchPattern, pageSize, offset]);

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(*) as count FROM ${this.tableName}
      WHERE 
        full_name ILIKE $1 OR
        email_address ILIKE $1 OR
        company_name ILIKE $1 OR
        project_description ILIKE $1
    `;

    const countResult = await this.executeQuery(countSql, [searchPattern]);
    const totalCount = parseInt(countResult.rows[0].count);

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

export default SubmissionModel;


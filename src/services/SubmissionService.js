/**
 * Submission Service
 * Business logic layer for intake submissions
 */

import SubmissionModel from '../models/SubmissionModel.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

export class SubmissionService {
  constructor() {
    this.submissionModel = new SubmissionModel();
  }

  /**
   * Create a new submission
   */
  async createSubmission(submissionData) {
    try {
      // Create submission through model (includes validation)
      const submission = await this.submissionModel.createSubmission(submissionData);

      // TODO: Send confirmation email
      // await this.sendConfirmationEmail(submission);

      // TODO: Notify admin of new submission
      // await this.notifyAdminNewSubmission(submission);

      return {
        success: true,
        data: submission,
        message: 'Submission created successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors
      }
      
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new ValidationError('Invalid submission ID');
    }

    const submission = await this.submissionModel.findById(parseInt(id));
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    return {
      success: true,
      data: submission
    };
  }

  /**
   * Get all submissions with filtering and pagination
   */
  async getSubmissions(filters = {}, page = 1, pageSize = 20) {
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 20));

    const result = await this.submissionModel.getAdminDashboard(
      filters, 
      validatedPage, 
      validatedPageSize
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: result.stats
    };
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(id, status, adminNotes = null) {
    if (!id || isNaN(parseInt(id))) {
      throw new ValidationError('Invalid submission ID');
    }

    // Check if submission exists
    const existingSubmission = await this.submissionModel.findById(parseInt(id));
    if (!existingSubmission) {
      throw new NotFoundError('Submission not found');
    }

    // Update status
    const updatedSubmission = await this.submissionModel.updateStatus(
      parseInt(id), 
      status, 
      adminNotes
    );

    // TODO: Send status update email to user
    // if (status === 'qualified') {
    //   await this.sendQualificationEmail(updatedSubmission);
    // }

    return {
      success: true,
      data: updatedSubmission,
      message: `Submission status updated to ${status}`
    };
  }

  /**
   * Search submissions
   */
  async searchSubmissions(searchTerm, page = 1, pageSize = 20) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }

    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 20));

    const result = await this.submissionModel.searchSubmissions(
      searchTerm.trim(),
      validatedPage,
      validatedPageSize
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      searchTerm: searchTerm.trim()
    };
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats() {
    const stats = await this.submissionModel.getSubmissionStats();

    // Calculate percentages
    const total = parseInt(stats.total);
    if (total > 0) {
      stats.new_percentage = Math.round((stats.new_count / total) * 100);
      stats.qualified_percentage = Math.round((stats.qualified_count / total) * 100);
      stats.homebuyer_percentage = Math.round((stats.homebuyer_count / total) * 100);
      stats.developer_percentage = Math.round((stats.developer_count / total) * 100);
    }

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Delete submission (admin only)
   */
  async deleteSubmission(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new ValidationError('Invalid submission ID');
    }

    const submission = await this.submissionModel.findById(parseInt(id));
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    const deletedSubmission = await this.submissionModel.deleteById(parseInt(id));

    return {
      success: true,
      data: deletedSubmission,
      message: 'Submission deleted successfully'
    };
  }

  /**
   * Validate submission data format
   */
  validateSubmissionFormat(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid submission data format');
    }

    // Check for required structure
    const requiredFields = [
      'full_name', 'email_address', 'phone_number',
      'buyer_category', 'financing_plan', 'land_status',
      'build_budget', 'construction_timeline', 'project_description'
    ];

    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  }

  /**
   * Get submissions by status
   */
  async getSubmissionsByStatus(status, page = 1, pageSize = 20) {
    const validStatuses = ['new', 'reviewed', 'qualified', 'disqualified', 'contacted'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await this.getSubmissions({ status }, page, pageSize);
  }

  /**
   * Get recent submissions
   */
  async getRecentSubmissions(days = 7, limit = 10) {
    const submissions = await this.submissionModel.findAll(
      {},
      'created_at DESC',
      limit
    );

    // Filter by date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSubmissions = submissions.filter(submission => 
      new Date(submission.created_at) >= cutoffDate
    );

    return {
      success: true,
      data: recentSubmissions,
      count: recentSubmissions.length,
      days
    };
  }

  // TODO: Email service methods
  // async sendConfirmationEmail(submission) {
  //   // Implementation for sending confirmation email
  // }

  // async sendQualificationEmail(submission) {
  //   // Implementation for sending qualification email
  // }

  // async notifyAdminNewSubmission(submission) {
  //   // Implementation for admin notification
  // }
}

export default SubmissionService;


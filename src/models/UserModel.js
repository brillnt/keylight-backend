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

  // TODO: Add email uniqueness checks  
  // TODO: Add relationship queries (getUserProjects, getUserSubmissions)
  // TODO: Add search and filtering capabilities
  // TODO: Override create() and updateById() with validation
}

export default UserModel;

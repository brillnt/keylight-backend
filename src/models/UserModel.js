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

  // TODO: Add user-specific validation methods
  // TODO: Add email uniqueness checks  
  // TODO: Add relationship queries (getUserProjects, getUserSubmissions)
  // TODO: Add search and filtering capabilities
  // TODO: Override create() and updateById() with validation
}

export default UserModel;

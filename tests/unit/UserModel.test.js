// tests/unit/UserModel.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import UserModel from '../../src/models/UserModel.js';
import { BaseModel } from '../../src/models/BaseModel.js';

describe('UserModel Unit Tests', () => {
  let userModel;

  beforeEach(() => {
    userModel = new UserModel();
  });

  describe('Instantiation and Inheritance', () => {
    it('should instantiate UserModel successfully', () => {
      expect(userModel).toBeDefined();
      expect(userModel).toBeInstanceOf(UserModel);
    });

    it('should extend BaseModel', () => {
      expect(userModel).toBeInstanceOf(BaseModel);
    });

    it('should set the correct table name', () => {
      expect(userModel.tableName).toBe('users');
    });

    it('should inherit BaseModel methods', () => {
      // Check that key BaseModel methods are available
      expect(typeof userModel.findById).toBe('function');
      expect(typeof userModel.findAll).toBe('function');
      expect(typeof userModel.create).toBe('function');
      expect(typeof userModel.updateById).toBe('function');
      expect(typeof userModel.deleteById).toBe('function');
      expect(typeof userModel.count).toBe('function');
      expect(typeof userModel.executeQuery).toBe('function');
    });

    it('should have executeQuery method from BaseModel', () => {
      expect(userModel.executeQuery).toBeDefined();
      expect(typeof userModel.executeQuery).toBe('function');
    });
  });

  describe('Initial State', () => {
    it('should have correct tableName property', () => {
      expect(userModel.tableName).toBe('users');
    });

    it('should not have any additional properties beyond BaseModel', () => {
      const expectedProperties = ['tableName'];
      const actualProperties = Object.getOwnPropertyNames(userModel);
      
      // UserModel should only add tableName (inherited from BaseModel constructor)
      expect(actualProperties).toEqual(expect.arrayContaining(expectedProperties));
    });
  });

  describe('Email Validation', () => {
    describe('validateEmail() instance method', () => {
      it('should validate correct email formats', () => {
        const validEmails = [
          'user@domain.com',
          'test.email@example.com',
          'user+tag@domain.co.uk',
          'firstname.lastname@company.org',
          'user123@test-domain.com'
        ];

        validEmails.forEach(email => {
          const result = userModel.validateEmail(email);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'notanemail',
          '@domain.com',
          'user@',
          'user.domain.com',
          'user@domain',
          'user@.com',
          'user..email@domain.com',
          'user@domain..com'
        ];

        invalidEmails.forEach(email => {
          const result = userModel.validateEmail(email);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        });
      });

      it('should handle edge cases gracefully', () => {
        const edgeCases = [
          { input: null, description: 'null' },
          { input: undefined, description: 'undefined' },
          { input: '', description: 'empty string' },
          { input: '   ', description: 'whitespace only' },
          { input: 123, description: 'number' },
          { input: {}, description: 'object' }
        ];

        edgeCases.forEach(({ input, description }) => {
          const result = userModel.validateEmail(input);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Invalid email format');
        });
      });
    });

    describe('UserModel.isValidEmail() static method', () => {
      it('should validate emails without instantiating UserModel', () => {
        expect(UserModel.isValidEmail('test@example.com')).toBe(true);
        expect(UserModel.isValidEmail('invalid-email')).toBe(false);
        expect(UserModel.isValidEmail(null)).toBe(false);
      });

      it('should work identically to instance method for valid emails', () => {
        const testEmails = ['user@domain.com', 'test+tag@example.co.uk'];
        
        testEmails.forEach(email => {
          const staticResult = UserModel.isValidEmail(email);
          const instanceResult = userModel.validateEmail(email);
          expect(staticResult).toBe(instanceResult.isValid);
        });
      });

      it('should handle edge cases efficiently', () => {
        // Test performance-focused edge case handling
        expect(UserModel.isValidEmail(null)).toBe(false);
        expect(UserModel.isValidEmail(undefined)).toBe(false);
        expect(UserModel.isValidEmail('')).toBe(false);
        expect(UserModel.isValidEmail('   ')).toBe(false);
        expect(UserModel.isValidEmail(123)).toBe(false);
      });
    });

    describe('UserModel.validateEmailDetailed() static method (bonus feature)', () => {
      it('should provide detailed validation without instantiation', () => {
        const result = UserModel.validateEmailDetailed('test@example.com');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should provide detailed error information for invalid emails', () => {
        const result = UserModel.validateEmailDetailed('invalid-email');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      });

      it('should match instance method results exactly', () => {
        const testCases = ['valid@email.com', 'invalid', null, '', '   '];
        
        testCases.forEach(testCase => {
          const staticResult = UserModel.validateEmailDetailed(testCase);
          const instanceResult = userModel.validateEmail(testCase);
          
          expect(staticResult.isValid).toBe(instanceResult.isValid);
          expect(staticResult.error).toBe(instanceResult.error);
        });
      });
    });
  });

  describe('Email Uniqueness Checking', () => {
    describe('emailExists() method', () => {
      it('should return false for non-existent email', async () => {
        const result = await userModel.emailExists('nonexistent@example.com');
        expect(result).toBe(false);
      });

      it('should handle invalid email formats gracefully', async () => {
        const result = await userModel.emailExists('not-an-email');
        expect(result).toBe(false);
      });

      it('should handle edge cases', async () => {
        expect(await userModel.emailExists(null)).toBe(false);
        expect(await userModel.emailExists(undefined)).toBe(false);
        expect(await userModel.emailExists('')).toBe(false);
      });
    });

    describe('findByEmail() method', () => {
      it('should return null for non-existent email', async () => {
        const result = await userModel.findByEmail('nonexistent@example.com');
        expect(result).toBe(null);
      });

      it('should handle invalid email formats gracefully', async () => {
        const result = await userModel.findByEmail('not-an-email');
        expect(result).toBe(null);
      });

      it('should handle edge cases', async () => {
        expect(await userModel.findByEmail(null)).toBe(null);
        expect(await userModel.findByEmail(undefined)).toBe(null);
        expect(await userModel.findByEmail('')).toBe(null);
      });
    });

    describe('UserModel.emailExists() static method', () => {
      it('should work without instantiating UserModel', async () => {
        const result = await UserModel.emailExists('static.test@example.com');
        expect(result).toBe(false);
      });

      it('should handle edge cases', async () => {
        expect(await UserModel.emailExists(null)).toBe(false);
        expect(await UserModel.emailExists('')).toBe(false);
      });
    });
  });

  describe('Relationship Queries', () => {
    describe('getUserProjects() method', () => {
      it('should return empty array for user with no projects', async () => {
        const userModel = new UserModel();
        const projects = await userModel.getUserProjects(999); // Non-existent user ID
        expect(Array.isArray(projects)).toBe(true);
        expect(projects).toHaveLength(0);
      });

      it('should return projects array with correct structure', async () => {
        const userModel = new UserModel();
        const projects = await userModel.getUserProjects(1);
        expect(Array.isArray(projects)).toBe(true);
        
        if (projects.length > 0) {
          const project = projects[0];
          expect(project).toHaveProperty('id');
          expect(project).toHaveProperty('name');
          expect(project).toHaveProperty('description');
          expect(project).toHaveProperty('status');
          expect(project).toHaveProperty('created_at');
        }
      });

      it('should handle invalid user IDs gracefully', async () => {
        const userModel = new UserModel();
        expect(await userModel.getUserProjects(null)).toEqual([]);
        expect(await userModel.getUserProjects(undefined)).toEqual([]);
        expect(await userModel.getUserProjects('invalid')).toEqual([]);
      });
    });

    describe('getUserSubmissions() method', () => {
      it('should return empty array for user with no submissions', async () => {
        const userModel = new UserModel();
        const submissions = await userModel.getUserSubmissions(999); // Non-existent user ID
        expect(Array.isArray(submissions)).toBe(true);
        expect(submissions).toHaveLength(0);
      });

      it('should return submissions array with correct structure', async () => {
        const userModel = new UserModel();
        const submissions = await userModel.getUserSubmissions(1);
        expect(Array.isArray(submissions)).toBe(true);
        
        if (submissions.length > 0) {
          const submission = submissions[0];
          expect(submission).toHaveProperty('id');
          expect(submission).toHaveProperty('full_name');
          expect(submission).toHaveProperty('email_address');
          expect(submission).toHaveProperty('status');
          expect(submission).toHaveProperty('created_at');
          // Optional project info if linked
          if (submission.project_id) {
            expect(submission).toHaveProperty('project_name');
          }
        }
      });

      it('should handle invalid user IDs gracefully', async () => {
        const userModel = new UserModel();
        expect(await userModel.getUserSubmissions(null)).toEqual([]);
        expect(await userModel.getUserSubmissions(undefined)).toEqual([]);
        expect(await userModel.getUserSubmissions('invalid')).toEqual([]);
      });

      it('should return submissions ordered by creation date (newest first)', async () => {
        const userModel = new UserModel();
        const submissions = await userModel.getUserSubmissions(1);
        
        if (submissions.length > 1) {
          for (let i = 0; i < submissions.length - 1; i++) {
            const current = new Date(submissions[i].created_at);
            const next = new Date(submissions[i + 1].created_at);
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
        }
      });
    });

    describe('UserModel static relationship methods', () => {
      it('should provide static getUserProjects method', async () => {
        const projects = await UserModel.getUserProjects(1);
        expect(Array.isArray(projects)).toBe(true);
      });

      it('should provide static getUserSubmissions method', async () => {
        const submissions = await UserModel.getUserSubmissions(1);
        expect(Array.isArray(submissions)).toBe(true);
      });

      it('should handle edge cases in static methods', async () => {
        expect(await UserModel.getUserProjects(null)).toEqual([]);
        expect(await UserModel.getUserSubmissions(null)).toEqual([]);
      });
    });
  });

  // ===== SEARCH AND FILTERING TESTS =====
  describe('Search and Filtering', () => {
    describe('searchUsers() method', () => {
      it('should return empty array when no search criteria provided', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers();
        expect(Array.isArray(results)).toBe(true);
        expect(results).toEqual([]);
      });

      it('should search by email (exact match)', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers({ email: 'john@example.com' });
        expect(Array.isArray(results)).toBe(true);
        // Results should have user structure
        if (results.length > 0) {
          expect(results[0]).toHaveProperty('id');
          expect(results[0]).toHaveProperty('email_address');
          expect(results[0]).toHaveProperty('full_name');
        }
      });

      it('should search by email (partial match)', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers({ email: '@example.com' });
        expect(Array.isArray(results)).toBe(true);
        // All results should contain the search term
        results.forEach(user => {
          expect(user.email_address.toLowerCase()).toContain('@example.com');
        });
      });

      it('should search by full name (exact match)', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers({ name: 'John Doe' });
        expect(Array.isArray(results)).toBe(true);
        // Results should match the name
        results.forEach(user => {
          expect(user.full_name.toLowerCase()).toContain('john doe');
        });
      });

      it('should search by name (partial match)', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers({ name: 'John' });
        expect(Array.isArray(results)).toBe(true);
        // Results should contain partial match
        results.forEach(user => {
          expect(user.full_name.toLowerCase()).toContain('john');
        });
      });

      it('should handle combined search criteria', async () => {
        const userModel = new UserModel();
        const results = await userModel.searchUsers({ 
          name: 'John',
          email: '@example.com' 
        });
        expect(Array.isArray(results)).toBe(true);
        // Results should match both criteria
        results.forEach(user => {
          expect(user.full_name.toLowerCase()).toContain('john');
          expect(user.email_address.toLowerCase()).toContain('@example.com');
        });
      });

      it('should handle invalid search criteria gracefully', async () => {
        const userModel = new UserModel();
        
        // Test null/undefined
        expect(await userModel.searchUsers(null)).toEqual([]);
        expect(await userModel.searchUsers(undefined)).toEqual([]);
        
        // Test empty object
        expect(await userModel.searchUsers({})).toEqual([]);
        
        // Test invalid types
        expect(await userModel.searchUsers('invalid')).toEqual([]);
        expect(await userModel.searchUsers(123)).toEqual([]);
      });
    });

    describe('findUsersWithFilters() method', () => {
      it('should return paginated results', async () => {
        const userModel = new UserModel();
        const results = await userModel.findUsersWithFilters({
          limit: 2,
          offset: 0
        });
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeLessThanOrEqual(2);
      });

      it('should sort results by specified field', async () => {
        const userModel = new UserModel();
        const results = await userModel.findUsersWithFilters({
          sortBy: 'full_name',
          sortOrder: 'ASC',
          limit: 10
        });
        expect(Array.isArray(results)).toBe(true);
        
        // Check if results are sorted by name
        if (results.length > 1) {
          for (let i = 0; i < results.length - 1; i++) {
            const currentName = results[i].full_name.toLowerCase();
            const nextName = results[i + 1].full_name.toLowerCase();
            expect(currentName.localeCompare(nextName)).toBeLessThanOrEqual(0);
          }
        }
      });

      it('should filter by creation date range', async () => {
        const userModel = new UserModel();
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const results = await userModel.findUsersWithFilters({
          createdAfter: yesterday.toISOString(),
          createdBefore: today.toISOString()
        });
        expect(Array.isArray(results)).toBe(true);
        
        // All results should be within date range
        results.forEach(user => {
          const createdAt = new Date(user.created_at);
          expect(createdAt.getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
          expect(createdAt.getTime()).toBeLessThanOrEqual(today.getTime());
        });
      });

      it('should handle pagination edge cases', async () => {
        const userModel = new UserModel();
        
        // Test invalid limit/offset
        expect(await userModel.findUsersWithFilters({ limit: -1 })).toEqual([]);
        expect(await userModel.findUsersWithFilters({ offset: -1 })).toEqual([]);
        expect(await userModel.findUsersWithFilters({ limit: 0 })).toEqual([]);
        
        // Test very large offset
        const results = await userModel.findUsersWithFilters({ 
          limit: 10, 
          offset: 999999 
        });
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
      });
    });

    describe('Static search methods', () => {
      it('should provide static searchUsers method', async () => {
        const results = await UserModel.searchUsers({ name: 'John' });
        expect(Array.isArray(results)).toBe(true);
      });

      it('should provide static findUsersWithFilters method', async () => {
        const results = await UserModel.findUsersWithFilters({ limit: 5 });
        expect(Array.isArray(results)).toBe(true);
      });

      it('should handle edge cases in static methods', async () => {
        expect(await UserModel.searchUsers(null)).toEqual([]);
        expect(await UserModel.findUsersWithFilters(null)).toEqual([]);
      });
    });
  });
});

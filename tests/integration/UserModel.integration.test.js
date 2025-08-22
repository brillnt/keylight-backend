// tests/integration/UserModel.integration.test.js
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import UserModel from '../../src/models/UserModel.js';
import { db, cleanDatabase } from '../setup.js';

let userModel;

beforeAll(() => {
  userModel = new UserModel();
});

// Clean database before each test for complete isolation
beforeEach(async () => {
  await cleanDatabase();
});

describe('UserModel Integration Tests', () => {
  
  describe('Email Validation Integration', () => {
    it('should validate email format before database operations', async () => {
      // Test that email validation works in integration context
      const validEmail = 'integration.test@example.com';
      const invalidEmail = 'not-an-email';

      // Valid email should pass validation
      const validResult = userModel.validateEmail(validEmail);
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();

      // Invalid email should fail validation
      const invalidResult = userModel.validateEmail(invalidEmail);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
      expect(invalidResult.error).toContain('Invalid email format');
    });

    it('should provide static validation methods for service layer usage', () => {
      // Simulate how services will use static methods
      const testEmails = [
        'service@example.com',
        'user.name+tag@domain.co.uk', 
        'invalid@',
        'no-at-symbol.com',
        null,
        undefined
      ];

      testEmails.forEach(email => {
        const isValid = UserModel.isValidEmail(email);
        const detailed = UserModel.validateEmailDetailed(email);
        
        // Static methods should be consistent
        expect(isValid).toBe(detailed.isValid);
        
        // For invalid emails, should have error message
        if (!isValid) {
          expect(detailed.error).toBeDefined();
          expect(typeof detailed.error).toBe('string');
        }
      });
    });

    it('should work correctly with database connection available', async () => {
      // Verify validation works in database-connected environment
      // This sets us up for future email uniqueness tests
      
      // Test that we can validate emails while database is available
      const result = UserModel.validateEmailDetailed('database.test@example.com');
      expect(result.isValid).toBe(true);
      
      // Verify database connection is working (preparation for uniqueness tests)
      const tableExists = await db.schema.hasTable('users');
      expect(tableExists).toBe(true);
      
      // Verify we can query the users table (empty initially)
      const userCount = await db('users').count('id as count').first();
      expect(parseInt(userCount.count)).toBe(0);
    });
  });

  describe('Database Integration Readiness', () => {
    it('should be ready for email uniqueness checking implementation', async () => {
      // This test documents the foundation for our next mini-mission
      
      // Verify UserModel can access the database through BaseModel
      expect(userModel.tableName).toBe('users');
      expect(typeof userModel.executeQuery).toBe('function');
      
      // Verify database is clean and ready for uniqueness tests
      const users = await userModel.findAll();
      expect(users).toEqual([]);
      
      // Document the expected interface for email uniqueness (coming next!)
      // These methods will be implemented in the next mini-mission:
      // - userModel.emailExists(email) -> boolean
      // - userModel.findByEmail(email) -> user or null
      // - userModel.createWithValidation(userData) -> user with email validation
      
      expect(true).toBe(true); // Test setup verification complete
    });
  });
});

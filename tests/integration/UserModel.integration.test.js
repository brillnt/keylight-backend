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

  describe('Email Uniqueness Integration', () => {
    it('should detect existing emails in database', async () => {
      // Insert a test user directly into database
      const testUser = {
        full_name: 'Test User',
        email_address: 'existing@example.com',
        phone_number: '555-0123'
      };

      await db('users').insert(testUser);

      // Test that emailExists detects the existing email
      const exists = await userModel.emailExists('existing@example.com');
      expect(exists).toBe(true);

      // Test that non-existing email returns false
      const notExists = await userModel.emailExists('notfound@example.com');
      expect(notExists).toBe(false);
    });

    it('should handle case-insensitive email checking', async () => {
      // Insert user with lowercase email
      const testUser = {
        full_name: 'Case Test User',
        email_address: 'casetest@example.com',
        phone_number: '555-0124'
      };

      await db('users').insert(testUser);

      // Test case-insensitive matching
      expect(await userModel.emailExists('casetest@example.com')).toBe(true);
      expect(await userModel.emailExists('CASETEST@EXAMPLE.COM')).toBe(true);
      expect(await userModel.emailExists('CaseTest@Example.Com')).toBe(true);
    });

    it('should find users by email address', async () => {
      // Insert a test user
      const testUser = {
        full_name: 'Find Me User',
        email_address: 'findme@example.com',
        phone_number: '555-0125'
      };

      const [insertedId] = await db('users').insert(testUser).returning('id');

      // Test findByEmail
      const foundUser = await userModel.findByEmail('findme@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.email_address).toBe('findme@example.com');
      expect(foundUser.full_name).toBe('Find Me User');
      expect(foundUser.id).toBe(insertedId.id);

      // Test case-insensitive search
      const foundUserCaseInsensitive = await userModel.findByEmail('FINDME@EXAMPLE.COM');
      expect(foundUserCaseInsensitive).toBeDefined();
      expect(foundUserCaseInsensitive.id).toBe(insertedId.id);
    });

    it('should work with static methods', async () => {
      // Insert test data
      const testUser = {
        full_name: 'Static Test User',
        email_address: 'static@example.com',
        phone_number: '555-0126'
      };

      await db('users').insert(testUser);

      // Test static emailExists method
      const staticResult = await UserModel.emailExists('static@example.com');
      expect(staticResult).toBe(true);

      const staticNotFound = await UserModel.emailExists('notfound@static.com');
      expect(staticNotFound).toBe(false);
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

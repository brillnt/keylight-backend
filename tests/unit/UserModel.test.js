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
});

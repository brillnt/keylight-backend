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
});

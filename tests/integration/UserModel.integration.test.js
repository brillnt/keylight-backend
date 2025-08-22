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

  describe('Relationship Query Integration', () => {
    it('should retrieve user projects with real database relationships', async () => {
      const userModel = new UserModel();
      
      // Create test user
      const testUser = {
        full_name: 'Project Test User',
        email_address: 'project.user@example.com',
        phone_number: '555-0123',
        company_name: 'Test Projects Inc'
      };
      
      const insertedUser = await db('users').insert(testUser).returning('*');
      const userId = insertedUser[0].id;
      
      // Create test projects for this user
      const testProjects = [
        {
          name: 'Test Project 1',
          description: 'First test project',
          status: 'planning',
          user_id: userId,
          buyer_category: 'homebuyer',
          build_budget: '250k_350k'
        },
        {
          name: 'Test Project 2', 
          description: 'Second test project',
          status: 'active',
          user_id: userId,
          buyer_category: 'developer',
          build_budget: '500k_plus'
        }
      ];
      
      await db('projects').insert(testProjects);
      
      // Test getUserProjects method
      const projects = await userModel.getUserProjects(userId);
      expect(Array.isArray(projects)).toBe(true);
      expect(projects).toHaveLength(2);
      expect(projects[0]).toHaveProperty('name');
      expect(projects[0]).toHaveProperty('status');
      expect(projects[1]).toHaveProperty('name');
      expect(projects[1]).toHaveProperty('status');
    });

    it('should retrieve user submissions with real database relationships', async () => {
      const userModel = new UserModel();
      
      // Create test user
      const testUser = {
        full_name: 'Submission Test User',
        email_address: 'submission.user@example.com',
        phone_number: '555-0456'
      };
      
      const insertedUser = await db('users').insert(testUser).returning('*');
      const userId = insertedUser[0].id;
      
      // Create test submissions for this user
      const testSubmissions = [
        {
          full_name: 'Submission Test User',
          email_address: 'submission.user@example.com',
          phone_number: '555-0456',
          buyer_category: 'homebuyer',
          financing_plan: 'finance_build',
          land_status: 'need_land',
          build_budget: '350k_400k',
          construction_timeline: '6_to_12_months',
          project_description: 'Test submission 1',
          status: 'new',
          user_id: userId
        },
        {
          full_name: 'Submission Test User',
          email_address: 'submission.user@example.com', 
          phone_number: '555-0456',
          buyer_category: 'developer',
          financing_plan: 'self_funding',
          land_status: 'own_land',
          build_budget: '500k_plus',
          construction_timeline: '3_to_6_months',
          project_description: 'Test submission 2',
          status: 'reviewed',
          user_id: userId
        }
      ];
      
      await db('intake_submissions').insert(testSubmissions);
      
      // Test getUserSubmissions method
      const submissions = await userModel.getUserSubmissions(userId);
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions).toHaveLength(2);
      expect(submissions[0]).toHaveProperty('full_name');
      expect(submissions[0]).toHaveProperty('status');
      expect(submissions[1]).toHaveProperty('full_name');
      expect(submissions[1]).toHaveProperty('status');
      
      // Verify submissions are ordered by created_at (newest first)
      if (submissions.length > 1) {
        const firstDate = new Date(submissions[0].created_at);
        const secondDate = new Date(submissions[1].created_at);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    it('should work with static methods for service layer usage', async () => {
      // Create test user
      const testUser = {
        full_name: 'Static Test User',
        email_address: 'static.test@example.com',
        phone_number: '555-0789'
      };
      
      const insertedUser = await db('users').insert(testUser).returning('*');
      const userId = insertedUser[0].id;
      
      // Test static methods work without instantiation
      const projects = await UserModel.getUserProjects(userId);
      const submissions = await UserModel.getUserSubmissions(userId);
      
      expect(Array.isArray(projects)).toBe(true);
      expect(Array.isArray(submissions)).toBe(true);
    });

    it('should handle users with mixed relationship data', async () => {
      const userModel = new UserModel();
      
      // Create user with both projects and submissions
      const testUser = {
        full_name: 'Mixed Data User',
        email_address: 'mixed.data@example.com',
        phone_number: '555-0999'
      };
      
      const insertedUser = await db('users').insert(testUser).returning('*');
      const userId = insertedUser[0].id;
      
      // Create project
      const testProject = {
        name: 'Mixed Test Project',
        description: 'Project with linked submission',
        status: 'planning',
        user_id: userId,
        buyer_category: 'homebuyer'
      };
      
      const insertedProject = await db('projects').insert(testProject).returning('*');
      const projectId = insertedProject[0].id;
      
      // Create submission linked to both user and project
      const testSubmission = {
        full_name: 'Mixed Data User',
        email_address: 'mixed.data@example.com',
        phone_number: '555-0999',
        buyer_category: 'homebuyer',
        financing_plan: 'finance_build',
        land_status: 'own_land',
        build_budget: '400k_500k',
        construction_timeline: 'less_than_3_months',
        project_description: 'Mixed relationship test',
        status: 'qualified',
        user_id: userId,
        project_id: projectId
      };
      
      await db('intake_submissions').insert(testSubmission);
      
      // Test both relationship methods
      const projects = await userModel.getUserProjects(userId);
      const submissions = await userModel.getUserSubmissions(userId);
      
      expect(projects).toHaveLength(1);
      expect(submissions).toHaveLength(1);
      
      // Verify the submission might include project information
      if (submissions[0].project_id) {
        expect(submissions[0].project_id).toBe(projectId);
      }
    });
  });

  describe('Search and Filtering Integration', () => {
    beforeEach(async () => {
      // Insert test users with varied data for search testing
      const testUsers = [
        {
          full_name: 'Alice Johnson',
          email_address: 'alice@example.com',
          phone_number: '555-0101'
        },
        {
          full_name: 'Bob Smith',
          email_address: 'bob@testdomain.com',
          phone_number: '555-0102'
        },
        {
          full_name: 'Charlie Johnson',
          email_address: 'charlie@example.com',
          phone_number: '555-0103'
        }
      ];
      
      await db('users').insert(testUsers);
    });

    it('should search users by email with real database', async () => {
      const userModel = new UserModel();
      
      // Search by exact email
      const exactResults = await userModel.searchUsers({ 
        email: 'alice@example.com' 
      });
      expect(exactResults).toHaveLength(1);
      expect(exactResults[0].full_name).toBe('Alice Johnson');
      
      // Search by partial email domain
      const partialResults = await userModel.searchUsers({ 
        email: '@example.com' 
      });
      expect(partialResults.length).toBeGreaterThanOrEqual(2); // Alice and Charlie
      
      partialResults.forEach(user => {
        expect(user.email_address).toContain('@example.com');
      });
    });

    it('should search users by name with real database', async () => {
      const userModel = new UserModel();
      
      // Search by full name
      const fullNameResults = await userModel.searchUsers({ 
        name: 'Alice Johnson' 
      });
      expect(fullNameResults).toHaveLength(1);
      expect(fullNameResults[0].email_address).toBe('alice@example.com');
      
      // Search by partial name (last name)
      const partialResults = await userModel.searchUsers({ 
        name: 'Johnson' 
      });
      expect(partialResults.length).toBe(2); // Alice and Charlie Johnson
      
      partialResults.forEach(user => {
        expect(user.full_name.toLowerCase()).toContain('johnson');
      });
    });

    it('should handle combined search criteria with real database', async () => {
      const userModel = new UserModel();
      
      const results = await userModel.searchUsers({
        name: 'Johnson',
        email: '@example.com'
      });
      
      // Should find Alice and Charlie (both Johnsons with @example.com)
      expect(results.length).toBe(2);
      results.forEach(user => {
        expect(user.full_name.toLowerCase()).toContain('johnson');
        expect(user.email_address).toContain('@example.com');
      });
    });

    it('should handle filtering and pagination with real database', async () => {
      const userModel = new UserModel();
      
      // Test pagination
      const page1 = await userModel.findUsersWithFilters({
        limit: 2,
        offset: 0,
        sortBy: 'full_name',
        sortOrder: 'ASC'
      });
      
      expect(page1.length).toBeLessThanOrEqual(2);
      
      // Test sorting - first user should be Alice (alphabetically first)
      if (page1.length > 0) {
        expect(page1[0].full_name).toBe('Alice Johnson');
      }
      
      // Test second page
      const page2 = await userModel.findUsersWithFilters({
        limit: 2,
        offset: 2,
        sortBy: 'full_name',
        sortOrder: 'ASC'
      });
      
      expect(Array.isArray(page2)).toBe(true);
    });

    it('should work with static search methods', async () => {
      // Test static searchUsers
      const searchResults = await UserModel.searchUsers({ 
        name: 'Bob' 
      });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].full_name).toBe('Bob Smith');
      
      // Test static findUsersWithFilters
      const filterResults = await UserModel.findUsersWithFilters({
        limit: 1,
        sortBy: 'email_address',
        sortOrder: 'DESC'
      });
      expect(filterResults.length).toBeLessThanOrEqual(1);
    });
  });
});
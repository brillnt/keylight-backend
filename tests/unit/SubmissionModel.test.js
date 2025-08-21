// tests/unit/SubmissionModel.test.js
import { describe, it, expect } from 'vitest';
import { SubmissionModel } from '../../src/models/SubmissionModel.js';

describe('SubmissionModel Unit Tests', () => {
  const submissionModel = new SubmissionModel();

  it('should validate correct submission data', () => {
    const validData = {
      full_name: 'Jane Doe',
      email_address: 'jane.doe@example.com',
      phone_number: '555-555-5555',
      buyer_category: 'homebuyer',
      financing_plan: 'self_funding',
      land_status: 'own_land',
      lot_address: '123 Main St',
      build_budget: '250k_350k',
      construction_timeline: '3_to_6_months',
      project_description: 'A new home.'
    };
    expect(() => submissionModel.validateSubmissionData(validData)).not.toThrow();
  });

  it('should throw a validation error for invalid data', () => {
    const invalidData = { full_name: '' };
    expect(() => submissionModel.validateSubmissionData(invalidData)).toThrow();
  });
});

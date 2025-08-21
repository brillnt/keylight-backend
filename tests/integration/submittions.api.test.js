// tests/integration/submissions.api.test.js
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { db, cleanDatabase } from '../setup.js'; // Import the test database connection and clean function

let app;

// Create the app once for all tests in this file
beforeAll(() => {
  app = createApp();
});

// Clean database before each test for complete isolation
beforeEach(async () => {
  await cleanDatabase();
});

describe('Submissions API Integration Tests', () => {

  it('POST /api/submissions - should create a new submission', async () => {
    const newSubmission = {
        full_name: "Test User",
        email_address: "test.user@example.com",
        phone_number: "123-456-7890",
        buyer_category: "developer",
        financing_plan: "finance_build",
        land_status: "need_land",
        needs_help_finding_land: true,
        preferred_area_description: "Anywhere nice",
        build_budget: "500k_plus",
        construction_timeline: "more_than_12_months",
        project_description: "A very large project."
    };

    const response = await request(app)
      .post('/api/submissions')
      .send(newSubmission);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.email_address).toBe(newSubmission.email_address);
    expect(response.body.data.full_name).toBe(newSubmission.full_name);
  });

  it('GET /api/submissions - should return a list of submissions', async () => {
    // This test sets up its own test data for complete isolation
    const testSubmission = {
        full_name: "GET Test User",
        email_address: "get.test@example.com",
        phone_number: "987-654-3210",
        buyer_category: "homebuyer",
        financing_plan: "self_funding",
        land_status: "own_land",
        lot_address: '123 Test Street',
        build_budget: "250k_350k",
        construction_timeline: "3_to_6_months",
        project_description: "Test project for GET endpoint."
    };

    // Insert test data directly into database
    await db('intake_submissions').insert(testSubmission);

    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1); // Exactly what we inserted
    expect(response.body.data[0].email_address).toBe(testSubmission.email_address);
    expect(response.body.data[0].full_name).toBe(testSubmission.full_name);
  });

  it('GET /api/submissions - should return empty array when no submissions exist', async () => {
    // Clean database is guaranteed by beforeEach, so no submissions should exist
    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });
});

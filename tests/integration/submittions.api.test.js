// tests/integration/submissions.api.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { db } from '../setup.js'; // Import the test database connection

let app;

// Create the app once for all tests in this file
beforeAll(() => {
  app = createApp();
});

describe('Submissions API Integration Tests', () => {

  it('POST /api/submissions - should create a new submission', async () => {
    const newSubmission = {
        full_name: "Test User",
        email_address: "test.user@example.com", // A unique email for this test
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
    expect(response.body.data).toHaveProperty('id');
  });

  it('GET /api/submissions - should return a list of submissions', async () => {
    // SETUP: Create a submission directly in the database for this specific test
    await db('intake_submissions').insert({
        full_name: "Getter Test User",
        email_address: "getter.user@example.com",
        phone_number: "987-654-3210",
        buyer_category: "homebuyer",
        financing_plan: "self_funding",
        land_status: "own_land",
        lot_address: '123 Fake St',
        build_budget: "250k_350k",
        construction_timeline: "3_to_6_months",
        project_description: "Another project."
    });

    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    // We can be certain there is at least one submission
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});

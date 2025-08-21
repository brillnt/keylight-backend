// tests/integration/submissions.api.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

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
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.full_name).toBe(newSubmission.full_name);
  });

  it('GET /api/submissions - should return a list of submissions', async () => {
    const response = await request(app).get('/api/submissions');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

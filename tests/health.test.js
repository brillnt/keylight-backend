// tests/health.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../src/app.js';

describe('Health Check Tests', () => {
  let app;
  let server;

  // Use beforeAll to set up the server once for all tests in this file
  beforeAll(async () => {
    app = createApp();
    server = app.listen(3002); // Use a different port to avoid conflicts
    await new Promise(resolve => server.on('listening', resolve));
  });

  // Use afterAll to tear down the server once all tests are done
  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('GET /health should return 200 with status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.version).toBe('2.0.0-esm');
  });

  it('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body.error).toBe('Route not found');
  });
});
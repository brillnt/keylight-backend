/**
 * Health Check Tests
 * Basic server functionality and health endpoint testing
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import createApp from '../src/app.js';

describe('Health Check Tests', () => {
  let app;
  let server;

  before(async () => {
    // Create app instance (environment is set in .env file)
    app = createApp();
    
    // Start server on test port
    const port = 3001;
    server = app.listen(port);
    
    // Wait for server to be ready
    await new Promise(resolve => {
      server.on('listening', resolve);
    });
  });

  after(async () => {
    // Close server
    if (server) {
      await new Promise(resolve => {
        server.close(resolve);
      });
    }
  });

  test('should start server without errors', () => {
    assert.ok(app, 'App should be defined');
    assert.ok(server, 'Server should be defined');
    assert.strictEqual(server.listening, true, 'Server should be listening');
  });

  test('GET /health should return 200 with status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    assert.strictEqual(response.body.status, 'OK');
    assert.strictEqual(response.body.version, '2.0.0-esm');
    assert.ok(response.body.timestamp, 'Timestamp should be present');
    assert.ok(typeof response.body.uptime === 'number', 'Uptime should be a number');
    assert.ok(response.body.environment, 'Environment should be present');
  });

  test('GET / should return API information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    assert.strictEqual(response.body.message, 'Keylight Backend API');
    assert.strictEqual(response.body.version, '2.0.0-esm');
    assert.strictEqual(response.body.architecture, 'ESM-native');
    assert.ok(response.body.environment, 'Environment should be present');
    assert.ok(response.body.endpoints, 'Endpoints should be defined');
    assert.ok(response.body.commands, 'Commands should be defined');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    assert.strictEqual(response.body.error, 'Route not found');
    assert.strictEqual(response.body.path, '/nonexistent');
    assert.strictEqual(response.body.method, 'GET');
    assert.ok(response.body.timestamp, 'Timestamp should be present');
  });

  test('health endpoint should have proper response headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    // Check security headers are present
    assert.strictEqual(response.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(response.headers['x-frame-options'], 'DENY');
    assert.strictEqual(response.headers['x-xss-protection'], '1; mode=block');
    
    // Check content type
    assert.match(response.headers['content-type'], /application\/json/);
  });

  test('server should handle multiple concurrent requests', async () => {
    const requests = Array(5).fill().map(() => 
      request(app).get('/health').expect(200)
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      assert.strictEqual(response.body.status, 'OK');
    });
  });
});


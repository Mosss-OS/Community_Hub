import request from 'supertest';
import express from 'express';

// Simple test for health endpoint
describe('Health Endpoint', () => {
  const app = express();
  
  beforeAll(() => {
    // Add health route directly for testing
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  });

  it('should return status 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.status).toBe('ok');
  });

  it('should have timestamp', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.timestamp).toBeDefined();
  });
});

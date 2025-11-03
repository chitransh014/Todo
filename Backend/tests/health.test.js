import request from 'supertest';
import app from '../src/app.js';

describe('Health Routes', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Todo AI App Backend is running');
  });
});

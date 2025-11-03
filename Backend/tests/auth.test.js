import request from 'supertest';
import app from '../src/app.js';

describe('Auth Routes', () => {
  it('should register a user (mock mode)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('registered successfully');
  });

  it('should login a user (mock mode)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Login successful');
  });
});

import request from 'supertest';
import app from '../src/app.js';

describe('Accountability Routes', () => {
  let token;

  beforeAll(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'accuser@example.com',
        password: 'password123',
        name: 'Accountability User',
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'accuser@example.com',
        password: 'password123',
      });
    token = loginResponse.body.token;
  });

  it('should generate share link', async () => {
    const response = await request(app)
      .post('/api/accountability/share')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(200);
    expect(response.body.shareToken).toBeDefined();
    expect(response.body.shareLink).toBeDefined();
  });
});

import request from 'supertest';
import app from '../src/app.js';

describe('Tasks Routes', () => {
  let token;

  beforeAll(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'taskuser@example.com',
        password: 'password123',
        name: 'Task User',
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'taskuser@example.com',
        password: 'password123',
      });
    token = loginResponse.body.token;
  });

  it('should create tasks (mock mode)', async () => {
    const response = await request(app)
      .post('/api/tasks/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goalTitle: 'Learn React',
        goalDescription: 'Master React development',
        energyLevel: 'high',
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('created successfully');
    expect(response.body.goal).toBeDefined();
    expect(response.body.tasks).toBeDefined();
  });
});

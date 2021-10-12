const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const UserService = require('../lib/services/UserService.js');

describe('lab16-authentication routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('signs up a user via POST', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    expect(res.body).toEqual({
      id: '1',
      email: 'blowfish@mariner.dingy',
    });
  });

  it('returns a 400 status error if email already exists', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    expect(res.status).toEqual(400);
  });

  it('logs in a user via POST', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'blowfish@mariner.dingy', password: 'bubbles' });

    expect(res.body).toEqual({
      id: '1',
      email: 'blowfish@mariner.dingy',
    });
  });

  it('returns a 401 status error if credentials are incorrect', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'blowfish@mariner.dingy',
      password: 'troubles',
    });

    expect(res.status).toEqual(401);
  });

  it('verifies GET /me route responds with the currently logged in user', async () => {
    const agent = request.agent(app);

    await agent.post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    await agent.post('/api/auth/login').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    const res = await agent.get('/api/auth/me');

    expect(res.body).toEqual({
      id: '1',
      email: agent.email,
    });
  });

  afterAll(() => {
    pool.end();
  });
});

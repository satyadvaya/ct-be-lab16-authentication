const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const UserService = require('../lib/services/UserService.js');
const Blathering = require('../lib/models/Blathering.js');

describe('lab16-authentication routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('signs up a user via POST', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      roleTitle: 'USER',
    });

    expect(res.body).toEqual({
      id: '1',
      email: 'blowfish@mariner.dingy',
      role: '2',
    });
  });

  it('returns a 400 status error if email already exists', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      roleTitle: 'USER',
    });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      role: '2',
    });

    expect(res.status).toEqual(400);
  });

  it('logs in a user via POST', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      roleTitle: 'USER',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'blowfish@mariner.dingy', password: 'bubbles' });

    expect(res.body).toEqual({
      id: '1',
      email: 'blowfish@mariner.dingy',
      role: '2',
    });
  });

  it('returns a 401 status error if credentials are incorrect', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      roleTitle: 'USER',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'blowfish@mariner.dingy',
      password: 'troubles',
      role: '2',
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
      email: 'blowfish@mariner.dingy',
      role: '2',
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('does not require a JWT to GET all blatherings', async () => {
    await UserService.create({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
      roleTitle: 'USER',
    });

    const brouhaha1 = await Blathering.create({
      bantererId: '1',
      burble: 'balderdash',
    });

    const brouhaha2 = await Blathering.create({
      bantererId: '1',
      burble: 'ballyhoo',
    });

    const res = await request(app).get('/api/blatherings');

    expect(res.body).toEqual([
      { ...brouhaha1, bantererId: '1' },
      { ...brouhaha2, bantererId: '1' },
    ]);
  });

  afterAll(() => {
    pool.end();
  });
});

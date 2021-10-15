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
      role: 'USER',
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
      role: 'USER',
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
      role: 'USER',
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

    const brouhaha1 = await Blathering.createBlathering({
      bantererId: '1',
      burble: 'balderdash',
    });

    const brouhaha2 = await Blathering.createBlathering({
      bantererId: '1',
      burble: 'ballyhoo',
    });

    const res = await request(app).get('/api/blatherings');

    expect(res.body).toEqual([
      { ...brouhaha1, bantererId: '1' },
      { ...brouhaha2, bantererId: '1' },
    ]);
  });

  it('is only accessible to users who are signed in', async () => {
    const agent = request.agent(app);

    const babble = await agent.post('/api/auth/signup').send({
      email: 'blowfish@mariner.dingy',
      password: 'bubbles',
    });

    const res = await agent.post('/api/blatherings').send({
      bantererId: '1',
      burble: 'bicker-bicker-bicker',
    });

    expect(res.body).toEqual({
      id: '1',
      bantererId: babble.body.id,
      burble: 'bicker-bicker-bicker',
    });
  });

  it('returns a 401 status error if the request does not have a valid JWT', async () => {
    const res = await request(app)
      .post('/api/blatherings')
      .send({ burble: 'banter' });

    expect(res.status).toEqual(401);
  });

  it('allows ADMIN roles to DELETE blatherings', async () => {
    await UserService.create({
      email: 'admin@example.com',
      password: 'admin-password',
      roleTitle: 'ADMIN',
    });

    await Blathering.createBlathering({
      bantererId: '1',
      burble: 'banter',
    });

    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'admin-password',
    });

    const res = await agent.delete('/api/blatherings/1');

    // expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: '1',
      bantererId: '1',
      burble: 'banter',
    });
  });

  it('returns a 401 status error if the request does not have a valid JWT on AUTH route', async () => {
    await UserService.create({
      email: 'admin@example.com',
      password: 'admin-password',
      roleTitle: 'USER',
    });

    await Blathering.createBlathering({
      bantererId: '1',
      burble: 'banter',
    });

    const res = await request(app).delete('/api/blatherings/1');

    expect(res.status).toEqual(401);
  });

  afterAll(() => {
    pool.end();
  });
});

const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe('lab16-authentication routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('signs up a user via POST', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'blowfish@mariner.dingy', password: 'bubbles' });

    expect(res.body).toEqual({
      id: 1,
      email: 'blowfish@mariner.dingy',
    });
  });

  afterAll(() => {
    pool.end();
  });
});

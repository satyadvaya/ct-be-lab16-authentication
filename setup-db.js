const pool = require('./lib/utils/pool.js');
const setup = require('./data/setup.js');
const UserService = require('./lib/services/UserService.js');

setup(pool)
  .then(() =>
    UserService.create({
      email: 'admin@example.com',
      password: process.env.ADMIN_PASSWORD,
      roleTitle: 'ADMIN',
    })
  )
  .catch((err) => console.error(err));
  .finally(() => process.exit());

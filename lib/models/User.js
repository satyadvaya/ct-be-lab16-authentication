const pool = require('../utils/pool');
const jwt = require('jsonwebtoken');
const Role = require('./Role');

module.exports = class User {
  id;
  email;
  passwordHash;
  role;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.passwordHash = row.password_hash;
    this.role = row.role_id;

    // user = {id: '1', email: 'blowfish@mariner.dingy', password_hash: '...', role: 'ADMIN'}
  }

  static async insert({ email, passwordHash, roleTitle }) {
    const role = await Role.findByTitle(roleTitle);

    const { rows } = await pool.query(
      `INSERT INTO users
        (email, password_hash, role_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [email, passwordHash, role.id]
    );

    // rows[0] = {id: '1', email: 'blowfish@mariner.dingy', password_hash: '...', role_id: '1'}
    // rows[0] and {role: 'ADMIN'}

    return new User({ ...rows[0], role: role.title });
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT *
      FROM users
      WHERE email = ($1)`,
      [email]
    );

    if (!rows[0]) return null;

    const role = await Role.findById(rows[0].role_id);

    return new User({ ...rows[0], role: role.title });
  }

  static async getUser(id) {
    const { rows } = await pool.query(
      `SELECT id
      FROM users
      WHERE users.id = ($1)`,
      [id]
    );
    return new User(rows[0]);
  }

  // const user = await User.findByEmail(...)
  // user.authToken()
  authToken() {
    return jwt.sign(this.toJSON(), process.env.APP_SECRET, {
      expiresIn: '24h',
    });
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
    };
  }
};

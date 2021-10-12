const pool = require('../utils/pool');

module.exports = class User {
  id;
  email;
  passwordHash;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.passwordHash = row.password_hash;
  }

  static async insert({ email, passwordHash }) {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );

    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = ($1)',
      [email]
    );

    if (!rows[0]) return null;

    return new User(rows[0]);
  }

  static async getUser(id) {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE users.id = ($1)',
      [id]
    );
    return new User(rows[0]);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
    };
  }
};

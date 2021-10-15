const pool = require('../utils/pool.js');

module.exports = class Blathering {
  id;
  burble;
  bantererId;

  constructor(row) {
    this.id = row.id;
    this.burble = row.burble;
    this.bantererId = row.banterer_id;
  }

  static async createBlathering({ burble, bantererId }) {
    const { rows } = await pool.query(
      `INSERT INTO blatherings
        (burble, banterer_id)
      VALUES ($1, $2)
      RETURNING *`,
      [burble, bantererId]
    );

    return new Blathering(rows[0]);
  }

  static async getAllBlatherings() {
    const { rows } = await pool.query(
      `SELECT *
        FROM blatherings`
    );

    return rows.map((row) => new Blathering(row));
  }

  static async deleteBlathering(id) {
    const { rows } = await pool.query(
      `DELETE FROM blatherings
      WHERE id = ($1)
      RETURNING *`,
      [id]
    );

    if (!rows[0]) return null;

    return new Blathering(rows[0]);
  }
};

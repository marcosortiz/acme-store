const { Pool } = require('pg');

const pool = new Pool();

async function query(query, params) {
  const {rows, fields} = await pool.query(query, params);

  return rows;
}

module.exports = {
  query
}
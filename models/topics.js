const db = require("../db/connection");

async function fetchTopics() {
  const results = await db.query(`SELECT * FROM topics;`);
  return results.rows;
}

module.exports = {
  fetchTopics
}
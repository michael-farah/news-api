const db = require("../db/connection");

exports.fetchTopics = async () => {
  const queryStr = `
    SELECT * FROM topics;
  `;

  const { rows } = await db.query(queryStr);
  return rows;
};
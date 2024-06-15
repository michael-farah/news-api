const db = require("../db/connection");

exports.getUsers = async () => {
  const queryStr = `
    SELECT * FROM users;
  `;

  const { rows } = await db.query(queryStr);
  return rows;
};
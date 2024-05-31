const db = require("../db/connection");

exports.getUsers = async () => {
  try {
    const { rows: users } = await db.query("SELECT * FROM users");
    return users;
  } catch (err) {
    return Promise.reject(err);
  }
};
const db = require("../connection");

const createTables = async () => {
  const topicsTablePromise = db.query(`
  CREATE TABLE topics (
    slug VARCHAR PRIMARY KEY,
    description VARCHAR
  );`);

  const usersTablePromise = db.query(`
  CREATE TABLE users (
    username VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR
  );`);

  await Promise.all([topicsTablePromise, usersTablePromise]);

  await db.query(`
  CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    topic VARCHAR NOT NULL REFERENCES topics(slug),
    author VARCHAR NOT NULL REFERENCES users(username),
    body VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    votes INT DEFAULT 0 NOT NULL
  );`);

  await db.query(`
  CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    body VARCHAR NOT NULL,
    article_id INT REFERENCES articles(article_id) NOT NULL,
    author VARCHAR REFERENCES users(username) NOT NULL,
    votes INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );`);
};

const dropTables = async () => {
  await db.query(`DROP TABLE IF EXISTS comments;`);
  await db.query(`DROP TABLE IF EXISTS articles;`);
  await db.query(`DROP TABLE IF EXISTS users;`);
  await db.query(`DROP TABLE IF EXISTS topics;`);
};

module.exports = { createTables, dropTables };

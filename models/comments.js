const db = require("../db/connection");
const { validateQueries } = require("../db/seeds/utils");

exports.fetchCommentsByArticleId = async (
  article_id,
  sort_by = "created_at",
  order = "desc",
) => {
  await validateQueries(sort_by, order);

  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Article ID must be a number.",
    });
  }

  const queryStr = `
    SELECT comment_id, votes, created_at, author, body, article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY ${sort_by} ${order};
  `;

  const { rows } = await db.query(queryStr, [article_id]);

  
  await checkArticleExists(article_id);

  return rows;
};

exports.addComment = async (article_id, username, body) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Article ID must be a number.",
    });
  }
  if (!username || !body) {
    return Promise.reject({ status: 400 });
  }
  await checkArticleExists(article_id);

  const queryStr = `
    INSERT INTO comments (body, author, article_id)
    VALUES ($1, $2, $3)
    RETURNING body, author, article_id;
  `;

  const { rows } = await db.query(queryStr, [body, username, article_id]);
  return rows[0];
};

exports.removeCommentById = async (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Comment ID must be a number.",
    });
  }

  const queryStr = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
  `;

  const { rows } = await db.query(queryStr, [comment_id]);

  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Comment not found." });
  }

  return rows[0];
};

const checkArticleExists = async (article_id) => {
  const queryStr = `
    SELECT EXISTS (
      SELECT 1 FROM articles WHERE article_id = $1
    ) AS "exists";
  `;

  const { rows } = await db.query(queryStr, [article_id]);
  if (!rows[0].exists) {
    return Promise.reject({ status: 404, msg: "Article not found." });
  }
};

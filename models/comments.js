const db = require("../db/connection");
const utils = require("../db/seeds/utils");

exports.fetchComments = async (
  article_id,
  sort_by = "created_at",
  order = "desc",
) => {
  utils.validateQueries(sort_by, order);
  const query = `
      SELECT 
        comments.comment_id, 
        comments.votes, 
        comments.created_at, 
        comments.author, 
        comments.body, 
        comments.article_id
      FROM comments
      WHERE article_id = $1 
      ORDER BY ${sort_by} ${order}`;
  try {
    const { rows: comments } = await db.query(query, [article_id]);
    if (comments.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return comments.map((comment) => {
      return {
        comment_id: comment.comment_id,
        votes: comment.votes,
        created_at: comment.created_at,
        author: comment.author,
        body: comment.body,
        article_id: comment.article_id,
      };
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.addComment = async (article_id, username, body) => {
  const query = ` INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING author, body, article_id`;
  try {
    const comment = await db.query(query, [article_id, username, body]);
    return comment.rows[0];
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.removeComment = async (comment_id) => {
  const query = `DELETE FROM comments WHERE comment_id = $1`;
  try {
    const comment = await db.query(
      "SELECT * FROM comments WHERE comment_id = $1",
      [comment_id],
    );
    if (comment.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment not found" });
    }
    await db.query(query, [comment_id]);
  } catch (err) {
    return Promise.reject(err);
  }
};
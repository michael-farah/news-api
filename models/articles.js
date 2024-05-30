const db = require("../db/connection");
const utils = require("../db/seeds/utils");
exports.fetchArticle = async (article_id) => {
  const {
    rows: [article],
  } = await db.query(`SELECT * FROM articles WHERE article_id=$1`, [
    article_id,
  ]);
  return article || Promise.reject({ status: 404, msg: "Article not found" });
};

exports.fetchArticles = async (sort_by = "created_at", order = "desc") => {
  utils.validateSortAndOrder(sort_by, order);

  const query = `
    SELECT 
      articles.article_id, 
      articles.author, 
      articles.title, 
      articles.topic, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

  const { rows: articles } = await db.query(query);
  return articles;
};

exports.updateArticle = async (article_id, inc_votes) => {
  const { rows: [article] } = await db.query(
    `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
    [inc_votes, article_id],
  );
  return article || Promise.reject({ status: 404, msg: "Article not found" });
};